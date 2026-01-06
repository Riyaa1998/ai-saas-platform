import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Music prompt is required"
  }),
  model: z.string().min(1),
  style: z.string().min(1),
});

export const MODELS = [
  {
    value: "audioldm",
    label: "AudioLDM (Basic)"
  },
  {
    value: "audioldm2",
    label: "AudioLDM 2 (Advanced)"
  },
  {
    value: "musicgen",
    label: "MusicGen (Meta AI)"
  }
];

export const STYLES = [
  {
    value: "cinematic",
    label: "Cinematic"
  },
  {
    value: "acoustic",
    label: "Acoustic"
  },
  {
    value: "electronic",
    label: "Electronic"
  },
  {
    value: "ambient",
    label: "Ambient"
  },
  {
    value: "lofi",
    label: "Lo-Fi"
  }
];
