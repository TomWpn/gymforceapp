# Firebase Password Reset Testing Guide

## How to Test the Forgot Password Flow

### 1. Prerequisites

- Make sure you have a test account created in your app
- Note the email address used for the test account

### 2. Testing Steps

1. **Navigate to Login Screen**
2. **Tap "Forgot Password?"** link
3. **Enter your test email address**
4. **Tap "Send Reset Email"**
5. **Check email inbox** (and spam folder)

### 3. What to Expect

#### Success Case:

- App shows: "If an account with [email] exists, you'll receive a password reset email shortly"
- You should receive an email from Firebase within 1-5 minutes
- Email will come from: `noreply@gymforceapp-778e1.firebaseapp.com`

#### Error Cases:

- **Invalid email format**: "Please enter a valid email address"
- **Network issues**: "Network error. Please check your internet connection"
- **Too many requests**: "Too many attempts. Please wait a few minutes"

### 4. Email Troubleshooting

#### If email doesn't arrive:

1. **Check spam/junk folder** (most common issue)
2. **Wait 5-10 minutes** - Firebase emails can be delayed
3. **Verify email address** - make sure it matches your account
4. **Try different email provider** - some block automated emails
5. **Check Firebase Console** - Authentication > Users to verify account exists

#### Email will contain:

- Reset link that expires in 1 hour
- Link opens in browser and redirects back to Firebase
- After reset, user can login with new password

### 5. Firebase Console Configuration

To customize the email template:

1. Go to **Firebase Console** → **Authentication** → **Templates**
2. Select **Password reset**
3. Customize the email template
4. Add your branding and messaging

### 6. Common Issues

#### "Email not found" but account exists:

- Firebase may not show this error for security reasons
- Check if account is disabled in Firebase Console

#### Reset link doesn't work:

- Link may have expired (1 hour limit)
- Request a new reset email

#### Multiple reset attempts:

- Firebase rate limits reset requests
- Wait 15-30 minutes between attempts

### 7. Production Considerations

For production, consider:

- Custom domain setup for better email deliverability
- Email template customization with your branding
- Monitoring email delivery rates in Firebase Console
- Setting up SMTP relay through a service like SendGrid

## Current Implementation

✅ **Working Features:**

- Email validation before sending
- Proper error handling with user-friendly messages
- Automatic navigation back to login after success
- Helpful user guidance in the UI

✅ **Security Features (by Firebase):**

- Rate limiting to prevent abuse
- Secure token generation and validation
- Automatic link expiration
- Protection against brute force attacks
