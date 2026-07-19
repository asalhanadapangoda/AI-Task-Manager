const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the API with the key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateProductivitySummary = async (stats) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let prompt;
    if (stats.role === 'admin') {
      prompt = `
        You are an AI assistant for a task management system. Analyze the following team statistics and provide a brief productivity summary with observations and suggestions. Keep it short and actionable.
        
        Stats: ${JSON.stringify(stats)}
        
        Format your response with the following sections:
        - Summary:
        - Observation:
        - Suggestion:
      `;
    } else {
      prompt = `
        You are an encouraging AI Coach and Mentor for a team member. Analyze their personal task statistics and output:
        1. A friendly, high-energy summary of what tasks they have assigned.
        2. A powerful, creative, and inspiring motivational message or quote to kickstart their day and keep them productive.
        
        Stats: ${JSON.stringify(stats)}
        
        Format your response with:
        - Personal Task Outlook:
        - Today's Motivation Boost:
      `;
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    // Friendly, robust fallback if the Gemini API key is invalid/unconfigured
    if (stats.role === 'admin') {
      return `
### AI Operations Synthesis (Fallback)

- **Summary**: Currently managing **${stats.totalTasks}** tasks with a completion rate of **${stats.completionRate}%** (${stats.completedTasks} resolved).
- **Observation**: There are **${stats.delayedTasks}** overdue tasks currently logged in the ledger.
- **Suggestion**: Consider review of node workloads and allocate support to pending dispatch items.
      `;
    } else {
      const quotes = [
        "\"Focus on being productive instead of busy.\" — Tim Ferriss",
        "\"The secret of getting ahead is getting started.\" — Mark Twain",
        "\"Quality means doing it right when no one is looking.\" — Henry Ford",
        "\"Action is the foundational key to all success.\" — Pablo Picasso"
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      return `
### AI Focus & Motivation Board (Fallback)

- **Personal Task Outlook**: You have **${stats.pendingTasks}** pending tasks remaining out of **${stats.totalTasks}** assigned. 
- **Today's Motivation Boost**: ${randomQuote}
      `;
    }
  }
};

const handleChatAssistant = async (question, userTasks) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are an AI Task Reminder Assistant for an employee. Answer their question based ONLY on the following tasks assigned to them. Be helpful, concise, and friendly. Do NOT mention Google, Gemini, or any LLM model name. Speak as a native, secure internal system assistant.

      User's Question: "${question}"
      
      User's Tasks: ${JSON.stringify(userTasks)}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error in AI Chat:', error);
    const pending = userTasks.filter(t => t.status !== 'Completed');
    if (pending.length === 0) {
      return "I'm having trouble reaching the assistant server, but I checked your record and you have no pending tasks. Great job!";
    }
    const titles = pending.slice(0, 3).map(t => `"${t.title}"`).join(', ');
    return `I'm having trouble reaching the assistant server right now. However, looking at your offline records, you have ${pending.length} active tasks, including: ${titles}.`;
  }
};

module.exports = {
  generateProductivitySummary,
  handleChatAssistant,
};
