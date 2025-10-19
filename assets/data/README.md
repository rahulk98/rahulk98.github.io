# Website Content Management

This directory contains all the maintainable content for the portfolio website. Instead of editing HTML files directly, you can now update the JSON files in this directory to modify the website content.

## File Structure

### Core Configuration
- **`config.json`** - Master configuration file that lists all data files and sections
- **`site.json`** - Site-wide settings, meta tags, and configuration

### Content Files
- **`personal.json`** - Personal information, hero section, and bio content
- **`projects.json`** - Project portfolio data (already existed)
- **`experience.json`** - Work experience data (already existed)
- **`skills.json`** - Technical skills and competencies
- **`education.json`** - Educational background
- **`publications.json`** - Research publications and papers
- **`navigation.json`** - Navigation menu and project filters

### Page-Specific Content
- **`privacy.json`** - Privacy policy content
- **`footer.json`** - Footer information and links
- **`error.json`** - 404 error page content

## How to Update Content

### 1. Personal Information
Edit `personal.json` to update:
- Name and title
- Bio/description
- Profile image path
- Contact information

### 2. Site Configuration
Edit `site.json` to update:
- Site title and description
- Social media links
- Google Analytics ID
- Theme settings

### 3. Skills Section
Edit `skills.json` to update:
- Add/remove skill categories
- Modify skill lists
- Update skill names

### 4. Education
Edit `education.json` to update:
- Add new degrees
- Update grades
- Modify institution names

### 5. Publications
Edit `publications.json` to update:
- Add new research papers
- Update publication details
- Modify URLs

### 6. Navigation
Edit `navigation.json` to update:
- Add/remove menu items
- Modify section IDs
- Update filter categories

## Adding New Content

### New Project
Add a new object to the `projects.json` array with:
```json
{
  "title": "Your Project Title",
  "date": "2024-01-01",
  "year": "2024",
  "slug": "your-project-slug",
  "category": "ml",
  "thumbnail": "assets/img/projects/your-project-thumb.jpg",
  "stack": ["Python", "TensorFlow"],
  "links": {
    "github": "https://github.com/yourusername/your-repo"
  },
  "summary": "Brief description",
  "problem": "Problem statement",
  "role": "Your role in the project",
  "outcome": "Results achieved"
}
```

### New Skill Category
Add to `skills.json`:
```json
{
  "title": "New Category",
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}
```

## Best Practices

1. **Always backup** your JSON files before making changes
2. **Validate JSON** syntax after editing (use online JSON validators)
3. **Test changes** by refreshing the website after updates
4. **Use consistent formatting** and indentation in JSON files
5. **Update the version** in `config.json` when making major changes

## Benefits of This Approach

- ✅ **Easy maintenance** - Update content without touching HTML
- ✅ **Consistent structure** - All content follows the same format
- ✅ **Version control friendly** - JSON changes are easy to track
- ✅ **Separation of concerns** - Content separate from presentation
- ✅ **Quick updates** - Change text, links, and settings in seconds

## Next Steps

The HTML templates and JavaScript need to be updated to use these JSON files. The existing `projects.json` and `experience.json` are already integrated, but other sections still use hardcoded content.