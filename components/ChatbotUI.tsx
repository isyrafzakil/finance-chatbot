import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Paper, TextField, Button, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';

export interface Message {
  user: string;
  text: string;
}

const ChatbotUI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load messages from local storage on component mount
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    // Save messages to local storage whenever they change
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { user: 'You', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call the API route to get the response from the Llama model
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input, history: messages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: Message = { user: 'FinCoach', text: data.response || 'Sorry, there was an error processing your request.' };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      const botMessage: Message = { user: 'FinCoach', text: `I'm a finance chatbot. Please make sure your question is related to personal finance, expense management, or Islamic finance.` };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <AppBar position="static" sx={{ backgroundColor: '#003366' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Finance Chatbot
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper elevation={3} sx={{ p: 2, mt: 2, minHeight: '400px' }}>
        <List>
          {messages.map((message, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={message.user}
                  secondary={<ReactMarkdown>{message.text}</ReactMarkdown>}
                  sx={{
                    textAlign: message.user === 'You' ? 'right' : 'left',
                    color: message.user === 'You' ? '#00796b' : '#d32f2f',
                  }}
                />
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </div>
          ))}
        </List>
        {loading && <Typography align="center" sx={{ mt: 2 }}>FinCoach is thinking...</Typography>}
      </Paper>
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ mr: 2 }}
          disabled={loading}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={loading}>
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default ChatbotUI;
