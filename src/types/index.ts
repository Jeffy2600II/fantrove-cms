export type GithubFile = {
  name: string;
  path: string;
  sha: string;
  download_url ? : string;
  type: string;
  size ? : number;
};

export type EditorFile = {
  filename: string;
  content: string;
  sha ? : string;
  isNew: boolean;
};