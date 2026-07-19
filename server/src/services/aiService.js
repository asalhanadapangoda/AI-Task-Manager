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
        You are an encouraging AI Coach and Mentor for a team member. Analyze their personal task statistics and active task details.
        
        Stats: ${JSON.stringify(stats)}
        
        Please output EXACTLY:
        1. A friendly, high-energy Personal Task Outlook.
        2. Today's Active Tasks list. For each active task, show:
           - **Task Name** (Priority: [Priority])
             *Description*: [Write a brief 1-sentence summary of the task]
             *AI Recommended Steps for Completion*:
             1. [Step 1]
             2. [Step 2]
             3. [Step 3]
        
        Do NOT output any motivation quotes, boosts, or slogans in this markdown summary. Do NOT mention Google, Gemini, or any LLM model name. Speak as a native, secure internal system assistant.
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
      let tasksListMarkdown = '';
      if (stats.activeTasksList && stats.activeTasksList.length > 0) {
        tasksListMarkdown = '\n### Today\'s Active Operations:\n' + stats.activeTasksList.map((t, idx) => `
**${idx + 1}. ${t.title}** (Priority: ${t.priority})
* *Description*: ${t.description || 'No detailed parameters supplied.'}
* *AI Recommended Steps for Completion*:
  1. Review operation scope and confirm required resources are ready.
  2. Execute execution parameters and perform validation test logs.
  3. Submit completed node logs to Supervisor for final review and close task.
`).join('\n');
      } else {
        tasksListMarkdown = '\n*All tasks completed! Node operational threshold clear.*';
      }

      return `
- **Personal Task Outlook**: You have **${stats.pendingTasks}** pending tasks remaining out of **${stats.totalTasks}** assigned.
${tasksListMarkdown}
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
