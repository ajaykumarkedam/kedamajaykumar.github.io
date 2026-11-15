# Kedam Ajay Kumar: engineering portfolio

A plain HTML/CSS/JavaScript site for GitHub Pages. There is nothing to install or build, and every step below works in the GitHub website.

```
index.html            home page
project.html          one page per project (project.html?id=<folder-name>)
site.json             your details: bio, contacts, skills, experience, education
projects.json         the list of projects shown on the site, in order
projects/<name>/      one folder per project (project.json + writeup.md + images)
assets/               styles, scripts, fonts, résumé PDF
examples/             a sample project showing every feature (not shown on the site)
PROJECT_TEMPLATE.md   paste into a chat to get a project zip
.nojekyll             makes GitHub serve the files as they are (do not delete)
```

## A. First upload (one time)

1. **Unzip** `portfolio.zip` on your laptop (Windows: right-click → *Extract All*). You get a folder called `portfolio`.
2. On github.com, click **+** (top right) → **New repository**.
   - Repository name: `<your-username>.github.io` (exactly your GitHub username, then `.github.io`). The site address will be `https://<your-username>.github.io/`.
   - Choose **Public**, because GitHub Pages on a free account needs a public repository.
   - Don't add a README. Click **Create repository**.
3. On the empty repository page, click the **uploading an existing file** link.
4. Open the `portfolio` folder on your laptop, select **everything inside it** (Ctrl+A), and drag it onto the GitHub page. Folders keep their structure. Wait until every file is listed.
5. Scroll down and click **Commit changes**.
6. **Add `.nojekyll`.** Windows often hides files that start with a dot, so it may not have been uploaded. In the repository, click **Add file → Create new file**, type `.nojekyll` as the name, leave the content empty, and click **Commit changes**. If GitHub says the file already exists, it's there already.

## B. Publish, check, unpublish

**To publish:**
1. In the repository, click **Settings** → **Pages** (left menu).
2. Under *Build and deployment*, set *Source* to **Deploy from a branch**, then *Branch* to **main** and folder **/ (root)**. Click **Save**.
3. Wait 1–2 minutes and refresh the Settings → Pages page. It shows **"Your site is live at https://…"** with a **Visit site** button. The **Actions** tab shows progress; a green tick means it's done.

**To unpublish:** go to Settings → Pages, click the **⋯** (three dots) next to "Your site is live at", and choose **Unpublish site**. The site goes offline, and your files stay in the repository.

**To publish again later:** go to Settings → Pages and set the branch to **main / (root)** again (click **Save**), or just commit any change. Wait 1–2 minutes.

Even while the site is unpublished, anyone who finds the repository can still read its files. To hide them too, go to **Settings → General → Danger Zone → Change repository visibility → Private** while you work. On a free account a private repository can't be published, so switch it back to **Public** before publishing again.

## C. Editing on the web

- **Change your details:** open `site.json`, click the **pencil icon** (Edit), change the text between the quotes, then **Commit changes**. Anything still in `[square brackets]` shows in orange on the site, so you can spot what is left.
- **Replace the résumé:** open `assets/resume/`, click **Add file → Upload files**, drag in your PDF *renamed to* `resume.pdf`, and commit. It replaces the old one.
- **Add a photo:** upload a square photo into `assets/img/` (e.g. `photo.jpg`), then in `site.json` set `"photo": "assets/img/photo.jpg"`.

Keep the quotes and commas in `site.json` exactly as they are. If the site shows a red box saying "Part of this page did not load", a comma or quote is usually missing near the line you last changed.

## D. Adding or updating a project

1. In the chat where you did the project, paste the contents of `PROJECT_TEMPLATE.md` and download the zip it makes, e.g. `motorcycle-stability.zip`.
2. Unzip it on your laptop. You get a folder named like `motorcycle-stability`.
3. In the repository, open the **projects** folder, then **Add file → Upload files**, drag in **the whole folder** (`motorcycle-stability`), and **Commit changes**. If a project with that name already exists, files with the same names are replaced.
4. **New projects only:** open `projects.json`, click the pencil icon, and add the folder name as a new line. Mind the comma after each line except the last:
   ```json
   [
     "new-project-name",
     "ev-thermosyphon-thesis",
     "blended-braking-controller"
   ]
   ```
   Commit. The order in this list is the order on the site.
5. If the site is published, it updates in 1–2 minutes. Refresh with Ctrl+Shift+R.

To **remove** a project from the site, delete its line from `projects.json`. To **show it in the Featured cards**, set `"featured": true` in its `project.json`; keep it to 4 featured projects.

## E. If something looks wrong

- **A red box says "Part of this page did not load".** It names the file that failed. Usually it's a misspelt folder name in `projects.json` or a missing comma or quote in a `.json` file.
- **A project's write-up shows as plain HTML, or a 404 appears.** `.nojekyll` is missing; see step A6.
- **Changes don't show.** Wait two minutes, then hard-refresh (Ctrl+Shift+R).
