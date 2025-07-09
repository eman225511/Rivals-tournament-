# Vercel Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Environment Variables (REQUIRED)
- [ ] `GITHUB_TOKEN` - Your GitHub personal access token
- [ ] `ADMIN_KEY` - Your chosen admin panel password

### 2. GitHub Token Permissions
- [ ] `repo` (Full control of private repositories)
- [ ] `public_repo` (Access public repositories)

## ✅ Post-Deployment Testing

### 1. Test API Endpoints
- [ ] Visit `https://your-app.vercel.app/api/test` - Should return success
- [ ] Visit `https://your-app.vercel.app/api/brackets` - Should return `{}` initially

### 2. Test Signup Flow
- [ ] Go to main page and accept rules
- [ ] Fill out signup form with test data
- [ ] Verify signup success message
- [ ] Check if Discord webhooks are sent

### 3. Test Brackets Page
- [ ] Visit `/brackets` page
- [ ] Should show "No teams have signed up yet" initially
- [ ] After signup, should display the team

### 4. Check Console Logs
- [ ] Open browser developer tools
- [ ] Check for any red errors in console
- [ ] All API calls should return 200 status

## 🔧 Common Issues & Solutions

### Issue: "CORS Error"
- **Solution**: Already fixed in the latest code

### Issue: "API not found"
- **Solution**: Ensure all files in `/api/` folder are deployed

### Issue: "GitHub API errors"
- **Solution**: Verify `GITHUB_TOKEN` is set correctly in Vercel

### Issue: "Signup not working"
- **Solution**: Check browser console for detailed error messages

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test the `/api/test` endpoint first
4. Check Vercel function logs in dashboard
