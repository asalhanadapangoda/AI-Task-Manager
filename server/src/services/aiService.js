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
        You are an AI Operational Coach for a team member. Analyze their personal task statistics and active task details.
        
        Stats: ${JSON.stringify(stats)}
        
        Format your response EXACTLY as a markdown document with the following three distinct sections. Deliver bullet points and list elements with ZERO indentation (no leading spaces on list lines) to ensure proper rendering. Keep it brief, point-wise, and extremely easy to read quickly.
        
        Use the following markdown structure:
        
        ### 1. Daily Operational Plan
        - [ ] **Block 1**: [Describe block focus, e.g. Focus on "Task Name" (Priority)]
        - [ ] **Block 2**: [Describe block focus, e.g. Focus on "Task Name" (Priority)]
        
        ### 2. Active Operations Ledger
        * **Task**: [Task Name]
        * **Priority**: [Priority]
        * **Deadline**: [Deadline Date]
        * **Description**: [Brief 1-sentence description]
        ---
        
        ### 3. AI Tactical Execution Steps
        **Tactical Steps for "[Task Name]":**
        - [ ] **Step 1**: [Instruction step 1]
        - [ ] **Step 2**: [Instruction step 2]
        - [ ] **Step 3**: [Instruction step 3]
        
        Do NOT mention Google, Gemini, or any LLM model name. Speak as a secure internal system assistant.
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
      let dailyPlanMarkdown = '';
      let operationsLedgerMarkdown = '';
      let executionStepsMarkdown = '';

      if (stats.activeTasksList && stats.activeTasksList.length > 0) {
        // Daily Plan
        dailyPlanMarkdown = stats.activeTasksList.map((t, idx) => 
`- [ ] **Block ${idx + 1}**: Focus on task **"${t.title}"** (Priority: ${t.priority}).
- [ ] **Check-in**: Perform intermediate milestones and check execution bounds.`
        ).join('\n');

        // Operations Ledger
        operationsLedgerMarkdown = stats.activeTasksList.map((t) => 
`* **Task**: ${t.title}
* **Priority**: ${t.priority}
* **Deadline**: ${t.deadline ? new Date(t.deadline).toLocaleDateString() : 'Immediate'}
* **Description**: ${t.description || 'No detailed parameters supplied.'}`
        ).join('\n---\n');

        // Execution Steps
        executionStepsMarkdown = stats.activeTasksList.map((t) => 
`**Tactical Steps for "${t.title}":**
- [ ] **Step 1**: Review task scope and verify prerequisites.
- [ ] **Step 2**: Execute target action items and record logs.
- [ ] **Step 3**: Validate output metrics and submit for review.`
        ).join('\n\n');

      } else {
        dailyPlanMarkdown = '\n*All tasks completed! Node operational threshold clear.*';
        operationsLedgerMarkdown = '\n*No active operations found.*';
        executionStepsMarkdown = '\n*No execution steps required.*';
      }

      return `
### 1. Daily Operational Plan
${dailyPlanMarkdown}

### 2. Active Operations Ledger
${operationsLedgerMarkdown}

### 3. AI Tactical Execution Steps
${executionStepsMarkdown}
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
