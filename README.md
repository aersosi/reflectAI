# reflectAI

**Intelligent Conversations with Customizable AI Models**  
A web application for interacting with Anthropic AI models, featuring session management, 
flexible settings, and dynamic prompts with variables.


![reflectAI Screenshot](https://github.com/aersosi/reflectAI/blob/main/public/reflectAI_120525.png?raw=true)

## Project Description

reflectAI is a user interface that enables interaction with various AI models from Anthropic. It solves the problem of simple and customizable communication with AI by allowing users to define system and user prompts, insert variables into those prompts, and control parameters such as model, temperature, and maximum tokens per session. The application is intended for developers or AI enthusiasts who need a flexible environment to test and utilize Anthropic models. Core features include session management (create, load, delete), dynamic variable substitution in prompts, and configuration of API keys and model parameters.

## Features

-   **Model Selection & Configuration** – Choose from available Anthropic models and adjust parameters like temperature and max tokens.
-   **Dynamic Prompting** – Define system and user prompts; use `{{variables}}` which are automatically detected and replaced at runtime.
-   **Session Management** – Create, name, load, and delete conversation sessions. Progress is automatically saved to Local Storage.
-   **Conversation History** – Track the dialogue with the AI and delete individual messages if needed.
-   **API Key Management** – Securely input your Anthropic API key (stored locally or used via environment variable).
-   **Flexible Layout** – Adjustable and collapsible sidebars for optimal workspace utilization.
-   **Light & Dark Mode** – Switch between light and dark themes for comfortable viewing.
-   **Responsive Design** – Adapts the interface for different screen sizes.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Direct interaction with the Anthropic API
- **Others:** Shadcn UI, TanStack Query, Axios, Lucide Icons, ESLint, Prettier

---


## Local Development

Follow these steps to set up and run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aersosi/reflectAI.git
    cd reflectAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    * Create a `.env` file in the root directory of the project.
    * Copy the contents of `.env.example` into the `.env` file.
    * Replace `your_API_key_here` with your actual Anthropic API key:
        ```
        VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
        ```
    * Alternatively, you can also enter the API key directly in the app under "Settings".

4.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

5.  **Open the application:**
    Navigate to the URL shown in your terminal (usually `http://localhost:5173`).
