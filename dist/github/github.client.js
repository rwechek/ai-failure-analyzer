import * as github from '@actions/github';
import * as core from '@actions/core';
export async function postPRComment(analysis) {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            core.warning('No GITHUB_TOKEN found. Skipping PR comment posting.');
            return;
        }
        const octokit = github.getOctokit(token);
        const context = github.context;
        // Validar si la ejecución actual proviene de un Pull Request
        const pullRequest = context.payload.pull_request;
        if (!pullRequest) {
            core.info('This action was not triggered by a Pull Request. Skipping comment.');
            return;
        }
        const owner = context.repo.owner;
        const repo = context.repo.repo;
        const pullNumber = pullRequest.number;
        // Construir el reporte en formato Markdown profesional
        const commentBody = `
## 🤖 AI Test Failure Analyzer Report

> **Confidence Level:** \`${analysis.confidenceLevel}\`

### 🔍 Root Cause
${analysis.rootCause}

### 💡 Suggested Code Fix
\`\`\`typescript
${analysis.codeSolution}
\`\`\`

---
*Generated autonomously by **ai-failure-analyzer** using Vercel AI SDK[cite: 1].*
`;
        // Publicar el comentario en el Pull Request
        await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: pullNumber,
            body: commentBody,
        });
        core.info(`Successfully posted AI analysis comment to PR #${pullNumber}`);
    }
    catch (error) {
        core.setFailed(`Failed to post comment to GitHub PR: ${error.message}`);
    }
}
