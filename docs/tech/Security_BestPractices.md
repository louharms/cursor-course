# Web Security Best Practices

## Introduction

Today I'm going to walk you through a comprehensive security checklist for web applications. This guide covers the 80-90% most important security measures to prevent common cybersecurity threats.

My goal is to help you understand security fundamentals and how to implement these protections in your own applications.

Let's break down these security measures into three categories: Frontend Security, Backend Security, and Practical Security Habits.

## Frontend Security

### Use HTTPS Everywhere

- Prevents basic eavesdropping and man-in-the-middle attacks
- Most modern frameworks use HTTPS by default
- When building locally, verify HTTPS is enabled
- On cloud platforms, this is typically handled automatically

**Sample LLM Analysis Prompt:** "Analyze my web application's network security. Check if all endpoints are using HTTPS, if there are any mixed content warnings, and if HSTS is properly implemented. Also, verify that all cookies are set with secure flags."

### Input Validation and Sanitization

- Prevents XSS (Cross-Site Scripting) attacks by validating all user inputs
- Validate and sanitize inputs on the frontend
- If using AI tools to implement this, verify the validation is actually working
- With ORMs, some validation happens automatically at the database level

**Sample LLM Analysis Prompt:** "Review my code for potential XSS vulnerabilities. Check all form inputs, URL parameters, and dynamic content rendering. Verify that user input is properly sanitized before being displayed or stored."

### Don't Store Sensitive Data in the Browser

- No secrets in localStorage or client-side code
- Structure your app with proper separation between frontend, backend, and database
- Frontend should communicate with backend, and backend should handle sensitive operations

**Sample LLM Analysis Prompt:** "Scan my frontend code for any sensitive data storage in localStorage, sessionStorage, or cookies. Check for hardcoded credentials, API keys, or user PII that shouldn't be stored client-side."

### CSRF Protection

- Implement anti-CSRF tokens for forms and state-changing requests
- Prevents attackers from mimicking form data submissions
- Implement using established libraries or frameworks

**Sample LLM Analysis Prompt:** "Examine my application for CSRF vulnerabilities. Check if all state-changing operations (POST, PUT, DELETE requests) include anti-CSRF tokens, and verify the token validation logic on the server side."

### Never Expose API Keys in Frontend

- API credentials should always remain server-side
- Don't hardcode API keys in your frontend code
- Don't make frontend calls that contain API keys
- Users can see network requests in browser dev tools
- Use secure storage methods (like environment variables) for sensitive credentials

**Sample LLM Analysis Prompt:** "Search my codebase for exposed API keys, tokens, or credentials in the frontend. Check for hardcoded values in JavaScript files, environment files committed to repositories, or sensitive data passed in API requests from the client."

## Backend Security

### Authentication Fundamentals

- Use established libraries and proper password storage (hashing+salting)
- For custom user data, ensure sensitive information is properly hashed and salted
- Remember: Users are trusting you with their data—protect it accordingly

**Sample LLM Analysis Prompt:** "Review my authentication system for security best practices. Check password storage methods, authentication flow, session management, and account recovery processes. Identify any deviations from current security standards."

### Authorization Checks

- Always verify permissions before performing actions
- Ensure protected routes actually check authorization
- Pay attention to detail when adding new endpoints or screens
- Verify that permission checks happen before any protected actions are performed

**Sample LLM Analysis Prompt:** "Evaluate my application's authorization controls. Check if there are proper permission checks before accessing protected resources, if role-based access control is implemented correctly, and if there are any potential privilege escalation vulnerabilities."

### API Endpoint Protection

- Implement proper authentication for every API endpoint
- Consider using CORS to restrict which domains can access your API
- For public APIs, implement token-based authentication

**Sample LLM Analysis Prompt:** "Analyze my API security configuration. Check if all endpoints require proper authentication, if CORS settings are restrictive and secure, and if there are any unprotected endpoints that could leak sensitive data or allow unauthorized actions."

### SQL Injection Prevention

- Use parameterized queries or ORMs, never raw SQL with user input
- ORMs provide a layer between your backend and database
- Type safety in schema definitions prevents many SQL injection vulnerabilities
- Proper frontend validation adds an additional layer of protection

**Sample LLM Analysis Prompt:** "Scan my database interaction code for SQL injection vulnerabilities. Check for any instances of raw SQL queries with concatenated user input, and verify that all database access uses parameterized queries, prepared statements, or ORM methods."

### Basic Security Headers

- Implement X-Frame-Options, X-Content-Type-Options, and HSTS
- Add these to your HTML files or server configuration
- Tools like securityheaders.com can help scan your site
- Be careful when implementing as some headers can break functionality

**Sample LLM Analysis Prompt:** "Check if my application implements all recommended security headers. Analyze the current headers and suggest missing ones like Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, and Referrer-Policy."

### DDoS Protection

- Use a CDN or cloud service with built-in DDoS mitigation capabilities
- Cloud platforms provide this protection automatically
- For self-hosted applications, you'll need to implement this separately

**Sample LLM Analysis Prompt:** "Evaluate my application's resilience against DoS and DDoS attacks. Check for rate limiting mechanisms, traffic monitoring, CDN integration, and scalability considerations that would help mitigate potential attacks."

## Practical Security Habits

### Keep Dependencies Updated

- Most vulnerabilities come from outdated libraries
- Regularly check for updates to your packages

**Sample LLM Analysis Prompt:** "Analyze my package.json (or equivalent dependency file) for outdated or vulnerable dependencies. Check if any packages have known security issues and recommend updates or alternatives."

### Proper Error Handling

- Don't expose sensitive details in error messages
- Be careful about what you log to the console in production
- Remember that users can see console output in their browser

**Sample LLM Analysis Prompt:** "Review my error handling logic for potential security issues. Check if detailed error messages are being returned to users, if stack traces are exposed in production, or if sensitive information might be included in logs."

### Secure Cookies

- Set HttpOnly, Secure, and SameSite attributes
- Important when handling user sessions
- If using authentication services, this may be handled for you

**Sample LLM Analysis Prompt:** "Analyze how my application uses cookies. Check if all cookies containing sensitive data have the HttpOnly, Secure, and SameSite attributes, and verify that session cookies have appropriate expiration policies."

### File Upload Security

- Validate file types, sizes, and scan for malicious content
- Restrict file types to only those you need
- Use secure storage with proper access controls
- Cloud storage services typically provide good security defaults

**Sample LLM Analysis Prompt:** "Review my file upload functionality for security vulnerabilities. Check if file types and sizes are properly validated, if files are scanned for malicious content, and if the storage location is properly secured against unauthorized access."

### Rate Limiting

- Implement on all API endpoints, especially authentication-related ones
- Prevents brute force attacks

**Sample LLM Analysis Prompt:** "Evaluate my application's rate limiting implementation. Check if authentication endpoints are protected against brute force attacks, if API endpoints have appropriate request limits, and if there are mechanisms to detect and block suspicious activity patterns."

## Conclusion

By implementing these security measures, you can be 95% confident your application is secure against common threats. Some cloud platforms handle many of these concerns automatically, but understanding the principles helps you build more secure applications wherever you're developing.

Remember that security is an ongoing process. Regularly review your code, keep dependencies updated, and stay informed about new security best practices.

## Security Checklist

### Frontend Security

- [ ] Use HTTPS everywhere
- [ ] Input validation and sanitization
- [ ] Don't store sensitive data in the browser
- [ ] CSRF protection
- [ ] Never expose API keys in frontend

### Backend Security

- [ ] Authentication fundamentals
- [ ] Authorization checks
- [ ] API endpoint protection
- [ ] SQL injection prevention
- [ ] Basic security headers
- [ ] DDoS protection

### Practical Security Habits

- [ ] Keep dependencies updated
- [ ] Proper error handling
- [ ] Secure cookies
- [ ] File upload security
- [ ] Rate limiting

## Comprehensive LLM Security Analysis Prompt

To perform a thorough security audit of your web application using an LLM, combine the individual prompts into a comprehensive analysis:

```
Perform a comprehensive security analysis of my web application focusing on these key areas:

1. HTTPS implementation and certificate configuration
2. Input validation and XSS prevention measures
3. Client-side data storage practices
4. CSRF protection mechanisms
5. API key and credentials management
6. Authentication system security
7. Authorization and access control
8. API endpoint security and CORS configuration
9. Database query security and SQL injection prevention
10. Security headers implementation
11. DDoS protection measures
12. Dependency management and update policies
13. Error handling and information exposure
14. Cookie security configuration
15. File upload validation and storage security
16. Rate limiting implementation

For each area, identify potential vulnerabilities, suggest improvements, and provide code examples or configuration changes to enhance security.
```
