import { NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference';

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { getAuthSession } from "@/lib/auth";

// Initialize Hugging Face with API key
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "");

interface ChatMessage {
  role: string;
  content: string; 
}

// System message for code generation
const instructionMessage: ChatMessage = {
  role: "system",
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(
  req: Request
) {
  try {
    const session = getAuthSession(req as any);
    const userId = session?.userId;
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return new NextResponse("Hugging Face API Key not configured.", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Add system instruction message and format for Hugging Face
    const allMessages = [instructionMessage, ...messages];
    
    // Extract user query (last user message)
    let userQuery = "";
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role.toLowerCase() === 'user') {
        userQuery = messages[i].content;
        break;
      }
    }
    
    console.log("Processing code generation request for:", userQuery);

    // Use GPT-2 directly - it's more reliable for our purposes
    const prompt = formatPromptForGPT2(userQuery);
    console.log("Sending request to Hugging Face with GPT-2 prompt:", prompt.slice(0, 100) + "...");

    try {
      const response = await Hf.textGeneration({
        model: "gpt2", 
        inputs: prompt,
        parameters: {
          max_new_tokens: 350, // Increased token limit for more complete code
          temperature: 0.4,
          top_p: 0.95,
          repetition_penalty: 1.2
        }
      });

      console.log("Received response from Hugging Face:", response.generated_text.slice(0, 50) + "...");

      // Process the generated text to extract usable code
      let generatedCode = processCodeOutput(userQuery, response.generated_text);
      
      if (!isPro) {
        await incrementApiLimit();
      }

      // Return the completion with proper markdown formatting
      return NextResponse.json({
        role: "assistant",
        content: generatedCode
      });
    } catch (error) {
      console.error("Error from Hugging Face API:", error);
      return new NextResponse("Failed to generate code. Please try again.", { status: 500 });
    }
  } catch (generalError) {
    console.error('[CODE_ERROR]', generalError);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Format prompt specifically for GPT-2
function formatPromptForGPT2(userQuery: string) {
  let prompt = "";
  const language = detectLanguage(userQuery);
  
  if (language === "react") {
    prompt = `Write React component code for: ${userQuery}\n\n`;
    prompt += "```jsx\nimport React, { useState } from 'react';\n\n";
    prompt += "// Component for a toggle button using React Hooks\nfunction ToggleButton() {\n  const [isToggled, setIsToggled] = useState(false);\n\n";
    prompt += "  const handleClick = () => {\n    setIsToggled(!isToggled);\n  };\n\n";
    prompt += "  return (\n    <button \n      onClick={handleClick}\n      className=\"px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition\"\n    >\n      {isToggled ? 'ON' : 'OFF'}\n    </button>\n  );\n}\n\n";
    prompt += "export default ToggleButton;\n```";
  } 
  else if (language === "c") {
    prompt = `Write a C program for: ${userQuery}\n\n`;
    prompt += "```c\n#include <stdio.h>\n#include <string.h>\n\n";
    prompt += "int main() {\n  // Variable declarations\n  char str[100];\n  printf(\"Enter a string: \");\n  gets(str);\n  \n  // Process the string\n  int len = strlen(str);\n  for(int i = 0; i < len/2; i++) {\n    char temp = str[i];\n    str[i] = str[len-i-1];\n    str[len-i-1] = temp;\n  }\n  \n  printf(\"Reversed string: %s\\n\", str);\n  return 0;\n}\n```";
  }
  else if (language === "python") {
    prompt = `Write Python code for: ${userQuery}\n\n`;
    prompt += "```python\ndef fibonacci(n):\n    \"\"\"Return the nth Fibonacci number.\"\"\"\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        a, b = 0, 1\n        for _ in range(2, n + 1):\n            a, b = b, a + b\n        return b\n\n";
    prompt += "# Test the function\nfor i in range(10):\n    print(f\"Fibonacci({i}) = {fibonacci(i)}\")\n```";
  }
  else {
    prompt = `Write JavaScript code for: ${userQuery}\n\n`;
    prompt += "```javascript\n/**\n * Example function implementation\n * @param {any} input - The input to process\n * @returns {string} - The result\n */\nfunction example(input) {\n  console.log('Processing:', input);\n  \n  // Add implementation here\n  \n  return 'Result: ' + input;\n}\n\n// Example usage\nconsole.log(example('test'));\n```";
  }
  
  return prompt;
}

// Detect the programming language from the query
function detectLanguage(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("react") || 
      lowerQuery.includes("component") || 
      lowerQuery.includes("jsx") || 
      lowerQuery.includes("button") ||
      lowerQuery.includes("toggle")) {
    return "react";
  }
  
  if (lowerQuery.includes("c program") || 
      lowerQuery.includes("c code") || 
      lowerQuery.includes("c language") || 
      lowerQuery.includes("stdio")) {
    return "c";
  }
  
  if (lowerQuery.includes("python") || 
      lowerQuery.includes("fibonacci") || 
      lowerQuery.includes("def ") || 
      lowerQuery.includes(".py")) {
    return "python";
  }
  
  return "javascript";
}

// Process the generated code to ensure it's complete and properly formatted
function processCodeOutput(userQuery: string, generatedText: string) {
  const language = detectLanguage(userQuery);
  
  // Extract code between backticks if it exists
  const codeBlockRegex = /```(?:\w*\n)?([\s\S]*?)```/;
  const match = generatedText.match(codeBlockRegex);
  
  let code = match ? match[1] : generatedText;
  
  // Prepare a complete code block based on the query type
  let finalOutput = "";
  
  if (language === "react") {
    finalOutput = "```jsx\n";
    
    // Ensure the code has the necessary React imports
    if (!code.includes("import React")) {
      finalOutput += "import React, { useState } from 'react';\n\n";
    } else {
      finalOutput += code;
    }
    
    // Ensure the component has export
    if (!finalOutput.includes("export default")) {
      const componentNameMatch = finalOutput.match(/function\s+(\w+)/);
      const componentName = componentNameMatch ? componentNameMatch[1] : "Component";
      
      if (!finalOutput.endsWith("\n")) finalOutput += "\n";
      finalOutput += `\nexport default ${componentName};\n`;
    }
    
    finalOutput += "```";
  } 
  else if (language === "c") {
    finalOutput = "```c\n";
    
    // Ensure necessary C includes
    if (!code.includes("#include")) {
      finalOutput += "#include <stdio.h>\n#include <string.h>\n\n";
    } else {
      finalOutput += code;
    }
    
    // Ensure main function exists
    if (!finalOutput.includes("int main")) {
      finalOutput += "\nint main() {\n  // Your code here\n  return 0;\n}\n";
    }
    
    finalOutput += "```";
  }
  else if (language === "python") {
    finalOutput = "```python\n";
    if (!code.includes("def ")) {
      finalOutput += "def main():\n    # Your code here\n    pass\n\nif __name__ == \"__main__\":\n    main()\n";
    } else {
      finalOutput += code;
    }
    finalOutput += "\n```";
  }
  else {
    finalOutput = "```javascript\n";
    if (!code.includes("function")) {
      finalOutput += "function main() {\n  // Your code here\n  console.log('Hello, world!');\n}\n\nmain();\n";
    } else {
      finalOutput += code;
    }
    finalOutput += "\n```";
  }
  
  // Clean up any malformed code blocks or add missing parts
  finalOutput = finalOutput.replace(/```\s*```/g, "```\n```");
  
  return finalOutput;
}
