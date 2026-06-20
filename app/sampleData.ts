export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  category: 'Recent' | 'Yesterday' | 'Previous';
  messages: Message[];
}

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'chat-1',
    title: '🚀 Next.js 15 & SSO Integration',
    category: 'Recent',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'How can we implement a robust Single Sign-On (SSO) workflow in a Next.js App Router application? I want to make sure it handles session propagation correctly.',
        timestamp: '10:24 AM'
      },
      {
        id: 'm2',
        sender: 'assistant',
        text: `Implementing Single Sign-On (SSO) in a **Next.js App Router** project requires a clear understanding of client vs. server-side sessions. Here's a standard architecture breakdown:

### 1. Architectural Diagram
\`\`\`
[ Client App ] <--- Sessions ---> [ Next.js Middleware ]
      |                                   |
      | (Redirects / SSO Challenge)       | (Token Exchange)
      v                                   v
[ Enterprise IdP (Okta / Azure) ] <=======> [ SSO API Gateway ]
\`\`\`

### 2. Key Components
1. **Middleware (\`middleware.ts\`):** Intercepts incoming requests to verify if a session cookie exists. If missing, it initiates an OAuth authorization code flow redirecting to the IdP.
2. **Route Handlers (\`app/api/auth/callback/route.ts\`):** Handles the callback query from your SSO provider, exchanges the authorization code for tokens (ID/Access/Refresh tokens), sets encrypted HTTP-only session cookies, and redirects the user back to their intended destination.
3. **Session Context Provider:** Distributes session details (email, tenant ID, roles) down the React component tree for UI consumption.

Here is a snippet showing how you can structure your authentication route handler:

\`\`\`typescript
// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/sso-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Secure HTTP-only cookie configuration
    response.cookies.set('sso_session', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours session duration
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('SSO Token Exchange Failure:', error);
    return NextResponse.redirect(new URL('/login?error=sso_failed', request.url));
  }
}
\`\`\`

Would you like to explore configuring this specifically for **Azure AD / Microsoft Entra** or **Okta**?`,
        timestamp: '10:25 AM'
      },
      {
        id: 'm3',
        sender: 'user',
        text: 'Let\'s go with Microsoft Entra (Azure AD). What scopes do I need to ask for to get profile photos and basic details?',
        timestamp: '10:27 AM'
      },
      {
        id: 'm4',
        sender: 'assistant',
        text: `To retrieve basic user profiles and profile images via Microsoft Entra (Azure AD), you should request standard OpenID Connect scopes combined with Microsoft Graph API permissions.

### Recommended SSO Scopes

| Scope Name | API Provider | Description |
| :--- | :--- | :--- |
| \`openid\` | OpenID Connect | Requests an ID token containing core identity claims. |
| \`profile\` | OpenID Connect | Returns user details like name, preferred username, and locale. |
| \`email\` | OpenID Connect | Requests access to the user's primary email address. |
| \`User.Read\` | Microsoft Graph | Allows fetching profile photos (\`photo/$value\`) and job details. |

Here's how you initialize the authorization URL:
\`\`\`javascript
const params = new URLSearchParams({
  client_id: process.env.AZURE_CLIENT_ID,
  response_type: 'code',
  redirect_uri: process.env.AZURE_REDIRECT_URI,
  response_mode: 'query',
  scope: 'openid profile email User.Read',
  state: secureRandomStateToken(),
});
const authUrl = \`https://login.microsoftonline.com/\${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?\${params.toString()}\`;
\`\`\`

After login, you can request the profile picture by sending an authenticated GET request to:
\`\`\`http
GET https://graph.microsoft.com/v1.0/me/photo/$value
Authorization: Bearer <access_token>
\`\`\``,
        timestamp: '10:29 AM'
      }
    ]
  },
  {
    id: 'chat-2',
    title: '🧠 LLM Finetuning Roadmap',
    category: 'Recent',
    messages: [
      {
        id: 'm2_1',
        sender: 'user',
        text: 'What are the main steps to finetune a Llama 3 model on custom JSON enterprise schema files?',
        timestamp: 'Yesterday'
      },
      {
        id: 'm2_2',
        sender: 'assistant',
        text: 'Finetuning Llama 3 on structured JSON datasets requires proper formatting (Instruct templates) and utilizing techniques like QLoRA (Quantized Low-Rank Adaptation) to run efficiently on standard enterprise hardware. Here is a high-level roadmap:\n\n1. **Data Prep**: Convert your JSON schemas into system-user-assistant training pairs.\n2. **Quantization**: Load Llama 3 in 4-bit mode using `bitsandbytes`.\n3. **PEFT Configuration**: Inject trainable LoRA adapters instead of tuning all weights.\n4. **Supervised Fine-Tuning (SFT)**: Execute training using Hugging Face SFTTrainer.',
        timestamp: 'Yesterday'
      }
    ]
  },
  {
    id: 'chat-3',
    title: '🎨 Tailwind v4 Custom Animations',
    category: 'Yesterday',
    messages: [
      {
        id: 'm3_1',
        sender: 'user',
        text: 'How do I add custom glow and shimmers in Tailwind CSS v4 without writing raw CSS keyframes?',
        timestamp: 'Yesterday'
      },
      {
        id: 'm3_2',
        sender: 'assistant',
        text: 'In Tailwind v4, config is defined using `@theme` directives directly in your CSS files. You can specify keyframes and animation properties smoothly using the `@theme inline` or directly within globals.css. This avoids needing a separate `tailwind.config.js`!',
        timestamp: 'Yesterday'
      }
    ]
  },
  {
    id: 'chat-4',
    title: '📈 Database Query Optimization',
    category: 'Previous',
    messages: [
      {
        id: 'm4_1',
        sender: 'user',
        text: 'My PostgreSQL queries are slow on compound indexes. What should I check?',
        timestamp: '3 days ago'
      },
      {
        id: 'm4_2',
        sender: 'assistant',
        text: 'Verify the column order of your compound index. PostgreSQL queries can only use index prefixes effectively. Make sure columns queried with equality filters (`=`) come first, followed by range filters (`>`, `<`). Run `EXPLAIN ANALYZE` to check if it is performing an Index Scan or falling back to a Seq Scan.',
        timestamp: '3 days ago'
      }
    ]
  }
];

// Fallback dynamic responses for simulated streaming chat
export const MOCK_AI_RESPONSES: { keywords: string[]; text: string }[] = [
  {
    keywords: ['image', 'generate image', 'picture', '/image'],
    text: `Here is your generated image based on the prompt: **"A futuristic glassmorphic workspace layout with glowing networks"**
    
![Futuristic Workspace](/futuristic_workspace.png)

This layout features neon blue and purple glowing grid systems, representing clean enterprise SSO pathways. Feel free to refine the prompt for a new render!`
  },
  {
    keywords: ['hello', 'hi', 'hey', 'start'],
    text: "Hello! I am your Enterprise AI Assistant. How can I assist you with your project, authentication setup, or technical architecture today?"
  },
  {
    keywords: ['sso', 'saml', 'oidc', 'azure', 'okta', 'auth'],
    text: `To implement **Single Sign-On (SSO)** in your enterprise stack, you'll generally want to configure:
1. **Identity Provider (IdP):** Okta, Azure AD (Entra), or Auth0.
2. **Service Provider (SP):** Your application, using libraries like NextAuth / Auth.js or custom OAuth2 clients.
3. **SSO Redirect URI:** Registering your callback endpoint (e.g., \`https://app.enterprise.com/api/auth/callback\`) inside the IdP dashboard.

Would you like a sample configuration for a specific provider?`
  },
  {
    keywords: ['google', 'gmail', 'oauth'],
    text: `**Google OAuth 2.0 Integration Guide**

Google Authentication offers quick user access. Follow these steps:
1. Create a project in the **Google Cloud Console**.
2. Enable the **Identity APIs** and configure the OAuth consent screen.
3. Generate a **Client ID** and **Client Secret**.
4. Configure redirect URIs: \`http://localhost:3000/api/auth/callback/google\` for local development.

Make sure you secure access tokens using HttpOnly, encrypted cookies rather than exposed local storage.`
  },
  {
    keywords: ['code', 'react', 'tailwind', 'css', 'ts', 'js', 'html'],
    text: `Certainly! Here's a clean React component using modern CSS classes for a glassmorphism alert notification:

\`\`\`tsx
import React from 'react';

interface NotificationProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const GlassNotification: React.FC<NotificationProps> = ({ title, message, onClose }) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/20">
      <div className="absolute -top-10 -left-10 h-20 w-20 rounded-full bg-indigo-500/20 blur-xl"></div>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-white tracking-wide">{title}</h4>
          <p className="mt-1 text-sm text-zinc-400">{message}</p>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors duration-150">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
\`\`\``
  },
  {
    keywords: ['localstorage', 'store', 'storage'],
    text: "For high security in enterprise applications, **avoid storing authentication tokens (JWTs, Access Tokens) in localstorage**. Localstorage is vulnerable to Cross-Site Scripting (XSS) attacks. Instead, always use secure, **HTTP-only, SameSite=Lax (or Strict) cookies**, or store credentials in secure server-side session memory."
  },
  {
    keywords: ['help', 'features', 'what can you do'],
    text: `I can help you build and refine code, design enterprise SSO/OAuth workflows, optimize SQL queries, and construct polished layouts. Here are some quick topics you can ask me about:
- **Tailwind CSS v4** '@theme' configuration
- **Single Sign-On (SSO)** token exchange callback route code
- **Google Auth** configuration checklist
- Full React interactive prototypes with glassmorphic visuals`
  }
];

export const MOCK_DEFAULT_RESPONSE = `That's an interesting technical question! As your AI chat assistant, I'm pre-loaded with mock data. 

To help you build this out:
- **For SSO:** Look at how we handle OAuth code exchanges using Route Handlers.
- **For UI styling:** Check out the Tailwind CSS v4 variables we configured in \`globals.css\`.
- **For Client-side flow:** We are currently managing state inside the React component without relying on LocalStorage.

Let me know if you would like me to generate specific code templates or structural layouts for this request!`;
