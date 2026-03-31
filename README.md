# TrueTranslate

A modern, professional multilingual translator powered by Gemini AI.

## Features
- **AI-Powered**: Uses Google's Gemini models for high-quality, context-aware translations.
- **Multiple Tones**: Choose between Neutral, Formal, Casual, and Professional tones.
- **Dark Mode**: Fully responsive design with a beautiful dark mode.
- **History**: Keep track of your recent translations locally.
- **Clean UI**: Minimalist design with smooth animations.

## Deployment to GitHub Pages

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd TrueTranslate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your Gemini API Key**:
   Create a `.env` file in the root directory and add your key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   *Note: In the code, update `process.env.GEMINI_API_KEY` to `import.meta.env.VITE_GEMINI_API_KEY` if you want to use standard Vite environment variables for client-side only builds.*

4. **Build the project**:
   ```bash
   npm run build
   ```

5. **Deploy**:
   Upload the contents of the `dist` folder to your GitHub repository's `gh-pages` branch or configure GitHub Actions to deploy from the `main` branch.

## Security Note
For a production app, it is recommended to call the Gemini API from a backend server to keep your API key secure. This project is a client-side demonstration.
