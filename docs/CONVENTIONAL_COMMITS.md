# Conventional Commits 1.0.0

## Summary

Conventional Commits is a specification for adding human and machine readable meaning to commit messages. It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of. This convention dovetails with [SemVer](http://semver.org), by describing the features, fixes, and breaking changes made in commit messages.

**Important:** All commit messages MUST be written in Portuguese - Brazilian (PT-BR).

The commit message should be structured as follows:

---

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## Commit Structure

### Type

Must be one of the following:

*   **feat**: A new feature
*   **fix**: A bug fix
*   **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
*   **chore**: Other changes that don't modify src or test files
*   **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
*   **docs**: Documentation only changes
*   **perf**: A code change that improves performance
*   **refactor**: A code change that neither fixes a bug nor adds a feature
*   **revert**: Reverts a previous commit
*   **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
*   **test**: Adding missing tests or correcting existing tests

### Scope (Optional)

The scope provides additional contextual information and is contained within parentheses, e.g., `feat(parser): add ability to parse arrays`. It could be anything specifying the place of the commit change.

### Description

The description contains a succinct description of the change:
*   use the imperative, present tense: "change" not "changed" nor "changes"
*   don't capitalize the first letter
*   no dot (.) at the end

### Body (Optional)

A longer description of the change. The body MUST begin one blank line after the description. It should provide the motivation for the change and contrast this with previous behavior.

### Footer(s) (Optional)

The footer should contain information about **Breaking Changes** and is also the place to reference GitHub issues, Jira tickets, and other PRs that this commit closes or relates to. e.g. `Closes #123`.

**Breaking Change:** A commit that has the text `BREAKING CHANGE:` at the beginning of its optional body or footer section introduces a breaking API change. A BREAKING CHANGE can be part of commits of any type.

## Examples

### Commit message with description and breaking change footer

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### Commit message with `!` to draw attention to breaking change

```
refactor!: drop support for Node 6

BREAKING CHANGE: refactor to use JavaScript features not available in Node 6.
```

### Commit message with both `!` and BREAKING CHANGE footer

```
refactor!: drop support for Node 6

BREAKING CHANGE: refactor to use JavaScript features not available in Node 6.
```

### Commit message with no body

```
docs: correct spelling of CHANGELOG
```

### Commit message with scope

```
feat(lang): add polish language
```

### Commit message with multi-paragraph body and multiple footers

```
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Reviewed-by: Z
Refs: #123
```

For more information, see the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).
