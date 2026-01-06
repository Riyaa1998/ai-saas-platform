# Using Hugging Face with NexSynth AI

This project is configured to use Hugging Face's Inference API for AI-powered features, offering a wider range of machine learning models and capabilities compared to traditional API providers.

## Getting Started with Hugging Face

### 1. Set up a Hugging Face Account
1. Visit [Hugging Face](https://huggingface.co/) and create an account
2. Navigate to your profile settings and create an API key
3. Copy your API key for use in the application

### 2. Configure the Application
1. Add your Hugging Face API key to the `.env` file:
   ```
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```
2. Start the application with `npm run dev`

### 3. Available Features

The application uses specific Hugging Face models for each feature:

#### Text Chat
- Using Mistral 7B Instruct model (`mistralai/Mistral-7B-Instruct-v0.2`)
- Specialized for conversational AI with instruction-following capabilities
- Supports chat contexts and maintains conversation history

#### Code Generation
- Using CodeLlama 7B (`codellama/CodeLlama-7b-Instruct-hf`)
- Optimized for generating code in various programming languages
- Provides detailed code explanations in comments

#### Image Generation
- Using Stable Diffusion XL (`stabilityai/stable-diffusion-xl-base-1.0`)
- Creates high-quality images from text descriptions
- Supports customization of image dimensions and generation parameters

#### Speech-to-Text
- Using Whisper Large v3 (`openai/whisper-large-v3`)
- Transcribes speech in multiple languages
- Provides high-accuracy text output from audio files

## Customizing Models

You can modify which models are used for each feature by editing the corresponding API route files:

- Conversation: `app/api/conversation/route.ts`
- Code Generation: `app/api/code/route.ts`
- Image Generation: `app/api/image/route.ts`
- Speech-to-Text: `app/api/speech-to-text/route.ts`

Within each file, look for the `model` parameter in the Hugging Face API call and replace it with another compatible model ID.

## Available Hugging Face Models

### Text Generation Models
- `mistralai/Mistral-7B-Instruct-v0.2` - High-quality instruction-following model
- `meta-llama/Llama-2-7b-chat-hf` - Meta's conversational model
- `google/gemma-7b-it` - Google's instruction-tuned language model

### Code Generation Models
- `codellama/CodeLlama-7b-Instruct-hf` - Specialized for code generation
- `bigcode/starcoder2-15b` - Trained on code repositories
- `WizardLM/WizardCoder-15B-V1.0` - Optimized for code completion and debugging

### Image Generation Models
- `stabilityai/stable-diffusion-xl-base-1.0` - High-quality image generation
- `runwayml/stable-diffusion-v1-5` - Balance of speed and quality
- `prompthero/openjourney` - Stylized image generation

### Speech Recognition Models
- `openai/whisper-large-v3` - State-of-the-art speech recognition
- `distil-whisper/distil-large-v3` - Faster, lighter Whisper variant
- `facebook/wav2vec2-base-960h` - Alternative speech recognition model

## Benefits of Using Hugging Face

1. **Model Variety**: Access to thousands of open-source and proprietary models
2. **Customization**: Choose the best model for each specific task
3. **Community Support**: Benefit from continuous model improvements from the Hugging Face community
4. **Cost-Effective**: Many models are free to use through the Inference API
5. **Transparency**: Open-source models with documented limitations and capabilities

## Troubleshooting

If you encounter issues with the Hugging Face integration:

1. **Check API Key**: Ensure your API key is correctly set in the `.env` file
2. **Model Availability**: Verify the models are available through the Hugging Face Inference API
3. **Request Limits**: Be aware of rate limits on the Hugging Face API
4. **Model Parameters**: Adjust generation parameters for better results

For more details on the Hugging Face Inference API, visit [Hugging Face's documentation](https://huggingface.co/docs/api-inference/) 