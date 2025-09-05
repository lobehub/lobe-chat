class GitHubService {
  submitDBV1UpgradeError = (version: number, error?: { message: string }) => {
    // GitHub error reporting disabled
    console.error(`Database Migration Error V${version}:`, error);
  };

  submitImportError = (error?: { message: string }) => {
    // GitHub error reporting disabled
    console.error('Config Import Error:', error);
  };

  submitPgliteInitError = (error?: { message: string }) => {
    // GitHub error reporting disabled
    console.error('Database Init Error:', error);
  };
}

export const githubService = new GitHubService();