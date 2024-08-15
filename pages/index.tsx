// import { useState, FormEvent } from 'react';

// export default function Home() {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState('');

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     const res = await fetch('/api/chat', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ question }),
//     });
//     const data = await res.json();
//     setResponse(data.response);
//   };

//   return (
//     <div>
//       <h1>Finance Chatbot</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           placeholder="Ask me anything..."
//         />
//         <button type="submit">Send</button>
//       </form>
//       <div>{response}</div>
//     </div>
//   );
// }

// pages/index.tsx

import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatbotUI from '../components/ChatbotUI';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003366',
    },
    secondary: {
      main: '#00796b',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <ChatbotUI />
    </ThemeProvider>
  );
}

