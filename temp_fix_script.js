// This is a temporary script to help identify the exact line context for chart fixes
// Line numbers and context from the search results

const chartIssues = [
  {
    line: 172,
    pattern: 'stroke: "#374151"',
    replacement: 'stroke: theme.border'
  },
  {
    line: 180,
    pattern: 'fillShadowGradient: "#6EE7B7"',
    replacement: 'fillShadowGradient: theme.accent'
  },
  {
    line: 220,
    pattern: 'stroke: "#374151"',
    replacement: 'stroke: theme.border'
  },
  {
    line: 228,
    pattern: 'fillShadowGradient: "#6EE7B7"',
    replacement: 'fillShadowGradient: theme.accent'
  }
];

console.log('Chart fixes needed:', chartIssues);
