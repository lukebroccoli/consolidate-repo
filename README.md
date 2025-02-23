# consolidate-repo-script

I made this file so I could place the entire repo as context into claude/ chatgpt to get it to do things for me. When you run the command below it takes a directory and recursively turns it into a text file called consolidate-repo.txt. all .txt files are ignored in gitignore.

## To install dependencies:

```bash
bun install
```

To run:

```bash
bun run consolidate-repo.ts <repo path>
```

# How it works: 

Takes a directory and recursively turns it into a text file 
