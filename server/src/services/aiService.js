const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the API with the key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTaskSpecificSteps = (task) => {
  const title = task.title || 'Operation';
  const desc = task.description ? task.description.trim() : '';
  const textCombo = `${title} ${desc}`.toLowerCase();

  let step1Desc = desc ? `Review specifications ("${desc}") and set up workspace assets for **"${title}"**.` : `Review operational scope and set up workspace assets for **"${title}"**.`;
  let step2Desc = `Execute core implementation phase targeting **"${title}"** according to assigned parameters.`;
  let step3Desc = `Run validation tests for **"${title}"**, verify functional results, and mark task Completed.`;

  if (textCombo.includes('video') || textCombo.includes('reel') || textCombo.includes('media') || textCombo.includes('edit')) {
    step1Desc = desc ? `Review video concept ("${desc}") and gather raw footage/graphics for **"${title}"**.` : `Draft outline storyboard and gather raw media footage for **"${title}"**.`;
    step2Desc = `Assemble video timeline, add transitions, overlays, background audio, and color grading.`;
    step3Desc = `Render high-resolution export for **"${title}"**, conduct quality check, and publish output.`;
  } else if (textCombo.includes('email') || textCombo.includes('smtp') || textCombo.includes('mail') || textCombo.includes('notification')) {
    step1Desc = desc ? `Configure API transport & credentials ("${desc}") in server environment.` : `Configure API transport credentials (Resend/SMTP) in server environment.`;
    step2Desc = `Build responsive HTML email templates with dynamic variable bindings.`;
    step3Desc = `Dispatch test payloads for **"${title}"**, verify inbox deliverability, and check webhook logs.`;
  } else if (textCombo.includes('database') || textCombo.includes('mongo') || textCombo.includes('schema') || textCombo.includes('model') || textCombo.includes('sql')) {
    step1Desc = desc ? `Analyze database parameters ("${desc}") and define Mongoose schema constraints.` : `Define Mongoose schema models, data validation constraints, and database indexes.`;
    step2Desc = `Construct query controllers and CRUD access handlers for **"${title}"**.`;
    step3Desc = `Run test seed scripts, check query performance, and verify schema integrity.`;
  } else if (textCombo.includes('auth') || textCombo.includes('login') || textCombo.includes('jwt') || textCombo.includes('password') || textCombo.includes('user')) {
    step1Desc = desc ? `Review security requirements ("${desc}") and setup bcrypt hashing / JWT secrets.` : `Setup password hashing (bcrypt) and token-based JWT authentication middleware.`;
    step2Desc = `Build authentication routes, client state providers, and session guards.`;
    step3Desc = `Verify token expiration lifecycle, test login/logout flows, and confirm audit security.`;
  } else if (textCombo.includes('ui') || textCombo.includes('component') || textCombo.includes('page') || textCombo.includes('react') || textCombo.includes('design') || textCombo.includes('style')) {
    step1Desc = desc ? `Design UI component layout for **"${title}"** based on parameters: "${desc}".` : `Construct responsive UI component layouts using Tailwind CSS design tokens.`;
    step2Desc = `Connect React state management hooks and bind backend API endpoints.`;
    step3Desc = `Perform cross-browser visual review, verify responsiveness, and test user interactions.`;
  } else if (textCombo.includes('api') || textCombo.includes('route') || textCombo.includes('backend') || textCombo.includes('server') || textCombo.includes('controller')) {
    step1Desc = desc ? `Review API specification ("${desc}") and define RESTful route signatures.` : `Design RESTful endpoint signatures, request payload validators, and route handlers.`;
    step2Desc = `Implement business logic in controller modules for **"${title}"** with error handling.`;
    step3Desc = `Execute HTTP request tests, verify payload responses, and confirm status code handling.`;
  } else if (textCombo.includes('bug') || textCombo.includes('fix') || textCombo.includes('debug') || textCombo.includes('refactor') || textCombo.includes('issue')) {
    step1Desc = desc ? `Investigate reported issue ("${desc}"), inspect logs, and isolate source files.` : `Reproduce reported issue, inspect stack traces, and isolate target codebase files.`;
    step2Desc = `Apply targeted code fix or refactoring for **"${title}"** while maintaining stability.`;
    step3Desc = `Run test suite, verify fix resolution, and confirm no regression errors occur.`;
  }

  return [step1Desc, step2Desc, step3Desc];
};

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
        For EACH active task, provide 3 highly specific, technical, domain-tailored tactical execution steps based on the task title and description. Do NOT output generic placeholders.
        Format like:
        **Tactical Steps for "[Task Name]":**
        - [ ] **Step 1**: [Specific instruction step 1 tailored to task title/description]
        - [ ] **Step 2**: [Specific instruction step 2 tailored to task title/description]
        - [ ] **Step 3**: [Specific instruction step 3 tailored to task title/description]
        
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
        executionStepsMarkdown = stats.activeTasksList.map((t) => {
          const steps = generateTaskSpecificSteps(t);
          return `**Tactical Steps for "${t.title}":**
- [ ] **Step 1**: ${steps[0]}
- [ ] **Step 2**: ${steps[1]}
- [ ] **Step 3**: ${steps[2]}`;
        }).join('\n\n');

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

const generateOfflineAnswer = (question, userTasks) => {
  const q = (question || '').toLowerCase();
  const pending = userTasks.filter(t => t.status !== 'Completed');

  // Find if question matches an active task
  const matchedTask = pending.find(t => {
    const titleWords = t.title.toLowerCase().split(' ');
    return titleWords.some(w => w.length > 3 && q.includes(w)) || q.includes(t.title.toLowerCase());
  });

  // 1. Greetings
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q === 'help') {
    if (pending.length === 0) {
      return `Hello! 👋 You're all caught up! You have 0 pending tasks in your workload. How can I assist you with technical or system queries?`;
    }
    return `Hello! 👋 I am your AI Operations & Task Completion Assistant.

You currently have **${pending.length}** active task(s):
${pending.map((t, i) => `${i + 1}. **${t.title}** (Priority: ${t.priority || 'Normal'})`).join('\n')}

Ask me any question about how to complete your tasks, technical configuration steps, deadlines, or guidance!`;
  }

  // 2. Task List / Overview queries
  if (q.includes('task list') || q.includes('all task') || q.includes('pending task') || q.includes('my task') || q === 'tasks') {
    if (pending.length === 0) {
      return `Great news! You have no pending operations logged. All tasks are resolved.`;
    }
    const list = pending.map((t, i) => `### ${i + 1}. ${t.title}
* **Priority**: ${t.priority || 'Normal'}
* **Status**: ${t.status}
* **Deadline**: ${t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}
* **Description**: ${t.description || 'No detailed parameters supplied.'}`).join('\n\n');

    return `Here is the breakdown of your active operations:\n\n${list}`;
  }

  // 3. Deadlines
  if (q.includes('deadline') || q.includes('due date') || q.includes('when due') || q.includes('when is')) {
    if (pending.length === 0) return `You have no upcoming deadlines. All active tasks are completed!`;
    const list = pending.map(t => `* **${t.title}**: Due ${t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No explicit date set'}`).join('\n');
    return `### Upcoming Operation Deadlines:\n\n${list}`;
  }

  // 4. Priority
  if (q.includes('priority') || q.includes('important') || q.includes('first')) {
    const high = pending.filter(t => t.priority === 'High');
    if (high.length > 0) {
      return `### High Priority Target:
Your top priority task is **"${high[0].title}"**.

**Recommended Actions**:
1. Review required configuration parameters.
2. Execute core implementation.
3. Test and verify functionality before marking complete.`;
    }
    if (pending.length > 0) {
      return `Your highest pending task is **"${pending[0].title}"** (Priority: ${pending[0].priority || 'Normal'}).`;
    }
    return `No pending tasks found. Your operational queue is clean!`;
  }

  // 5. How to complete / assistance for Email or specific task topics
  if (q.includes('email') || q.includes('smtp') || q.includes('brevo') || q.includes('resend') || q.includes('nodemailer') || (matchedTask && matchedTask.title.toLowerCase().includes('email'))) {
    return `### Guide: How to Complete "Configure Email Service Integration"

Here are the exact step-by-step instructions to complete this task:

1. **Environment Configuration**:
   Verify your \`.env\` file in the server directory:
   \`\`\`env
   RESEND_API_KEY=re_VoBbB4a5_9HsXMY6abLH8YVDYtYsKUTWh
   \`\`\`

2. **Email Service Code**:
   Check \`server/src/utils/sendEmail.js\` for the dispatch function.

3. **Execute & Test**:
   Trigger an API call or onboarding event to verify the email reaches the target mailbox.

4. **Mark as Complete**:
   Navigate to **My Tasks** in the dashboard and change the status of **"Configure Email Service Integration"** to **Completed**.`;
  }

  // 6. General "How to complete" / "How to do" / specific task guidance
  if (q.includes('how to complete') || q.includes('how to do') || q.includes('how do i') || q.includes('steps to') || q.includes('help') || q.includes('complete task') || q.includes('guidance')) {
    const target = matchedTask || (pending.length > 0 ? pending[0] : null);
    if (target) {
      return `### Complete Execution Guide for "${target.title}"

To complete this task successfully, follow these step-by-step instructions:

1. **Review Task Scope**:
   - Title: **${target.title}**
   - Priority: **${target.priority || 'Normal'}**
   - Description: ${target.description || 'Review the task requirements and source code files.'}

2. **Implementation Steps**:
   - Step 1: Open the relevant source files in the project workspace.
   - Step 2: Implement the required code or configuration changes.
   - Step 3: Run your local server (\`npm run dev\`) and verify functionality.

3. **Close Task**:
   - Open **My Tasks** on the left dashboard navigation.
   - Select **"${target.title}"** and update its status dropdown to **Completed**.`;
    }
  }

  // 7. Technical / General Questions (React, Node, Express, MongoDB, Auth, etc.)
  if (q.includes('react') || q.includes('vite') || q.includes('tailwind') || q.includes('css')) {
    return `### Frontend Technical Guidance
* **Framework**: React + Vite with Tailwind CSS.
* **State Management**: React Hooks (\`useState\`, \`useEffect\`).
* **API Requests**: Managed via Axios in \`client/src/utils/api.js\`.

If you are encountering UI errors or styling issues, check your browser developer tools console and component prop bindings.`;
  }

  if (q.includes('node') || q.includes('express') || q.includes('mongo') || q.includes('database') || q.includes('server') || q.includes('backend')) {
    return `### Backend Technical Guidance
* **Stack**: Node.js, Express, MongoDB Mongoose.
* **Controllers**: Located in \`server/src/controllers/\`.
* **Routes**: Configured in \`server/src/routes/\`.
* **Database**: Managed in \`server/src/config/db.js\`.

Ensure your server process is active on port 5000 (\`npm run dev\` in \`server/\`).`;
  }

  // 8. Default fallback for any other question
  if (pending.length > 0) {
    const top = pending[0];
    return `### Task Assistance for Your Request

Regarding your active operation **"${top.title}"**:
- **Priority**: ${top.priority || 'Normal'}
- **Status**: ${top.status}
- **Description**: ${top.description || 'No detailed parameters supplied.'}

**How to Complete**:
1. Implement the required code/configuration changes for this operation.
2. Run local validation tests to confirm proper execution.
3. Update the task status to **Completed** in your dashboard **My Tasks** page.

Feel free to ask for specific code examples or setup instructions!`;
  }

  return `### AI Task Assistant
Your workspace queue is currently clear with 0 pending tasks! 

Ask me any technical or system question (React, Node.js, Express, MongoDB, APIs, etc.) and I will provide exact step-by-step assistance!`;
};

const handleChatAssistant = async (question, userTasks) => {
  try {
    // Try Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are an expert AI Task Completion Assistant for a software application. Provide complete, accurate, detailed, and point-wise instructions to answer the user's question about their tasks, technical setup, or system functionality.
      
      User's Question: "${question}"
      
      Assigned Active Tasks: ${JSON.stringify(userTasks)}
      
      Format your answer cleanly with point-wise markdown, numbered steps, or code snippets. Speak as a helpful, internal AI assistant. Do NOT mention model names.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error in AI Chat, generating offline answer:', error.message);
    return generateOfflineAnswer(question, userTasks);
  }
};

module.exports = {
  generateProductivitySummary,
  handleChatAssistant,
};
