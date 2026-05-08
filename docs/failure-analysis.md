# Bug Report Summary

## BUG-01: Notification Click Does Not Navigate to Related Post
| Field | Details |
|-------|---------|
| **Bug #** | BUG-01 |
| **Title** | Notification Click Does Not Navigate to Related Post |
| **Description** | Clicking a notification marks it as read but does not take the user to the related post |
| **Steps to Reproduce** | 1. Go to Bell Icon > Notification tab <br> 2. Click on any notification <br> 3. Try to view the post |
| **Expected Behavior** | Clicking the notification navigates to the related post |
| **Actual Behavior** | Nothing happens - user stays on the Alerts page |
| **Root Cause** | Notification component has no click handler for navigation and no post reference in the data |
| **Fix Applied** | Not fixed |
| **Lesson Learned** | Notifications must include reference identifiers. Always add click handlers to interactive elements |

---

## BUG-02: Left Community Still Shows After Page Refresh
| Field | Details |
|-------|---------|
| **Bug #** | BUG-02 |
| **Title** | Left Community Still Shows After Page Refresh |
| **Description** | After leaving a community and refreshing, the community still appears in the list |
| **Steps to Reproduce** | 1. Sign in <br> 2. Go to profile > Communities tab <br> 3. Click Leave on a community <br> 4. Confirm <br> 5. Refresh the page |
| **Expected Behavior** | Community no longer appears after leaving and refreshing |
| **Actual Behavior** | Community still appears in both the profile tab and home page |
| **Root Cause** | App only updates temporary state in memory, not the database |
| **Fix Applied** | Not fixed |
| **Lesson Learned** | Changes that affect user data must be saved to the database immediately |

---

## BUG-03: User Cannot Delete Their Own Comments
| Field | Details |
|-------|---------|
| **Bug #** | BUG-03 |
| **Title** | User Cannot Delete Their Own Comments |
| **Description** | The delete button is missing or disabled on comments the user wrote |
| **Steps to Reproduce** | 1. Sign in <br> 2. Find a post where you left a comment <br> 3. Look for delete button <br> 4. Try to click it |
| **Expected Behavior** | User can delete their own comment with a confirmation message |
| **Actual Behavior** | Delete button is missing or disabled |
| **Root Cause** | No delete button or functionality exists for comments, only for posts |
| **Fix Applied** | Not fixed |
| **Lesson Learned** | Users should always be able to manage their own content. Always check if current user is the author |

---

## BUG-04: Profile Changes Not Saved After Refresh
| Field | Details |
|-------|---------|
| **Bug #** | BUG-04 |
| **Title** | Profile Changes Not Saved After Refresh |
| **Description** | Profile edits disappear after refreshing the page |
| **Steps to Reproduce** | 1. Sign in <br> 2. Go to profile <br> 3. Click Edit Profile <br> 4. Change name or bio <br> 5. Click Save <br> 6. Refresh the page |
| **Expected Behavior** | Updated profile information stays saved after refresh |
| **Actual Behavior** | Profile reverts back to original information after refresh |
| **Root Cause** | App only updates temporary state in memory, not the database |
| **Fix Applied** | Not fixed |
| **Lesson Learned** | All profile changes must be saved to the database immediately. Never rely on temporary state alone |

---

## BUG-05: User Display Name Not Showing After Sign In
| Field | Details |
|-------|---------|
| **Bug #** | BUG-05 |
| **Title** | User Display Name Not Showing After Sign In |
| **Description** | Display name is blank in the top bar and profile page after signing in |
| **Steps to Reproduce** | 1. Sign in <br> 2. Check top bar on home page <br> 3. Go to profile page <br> 4. Check display name |
| **Expected Behavior** | Display name appears in the top bar and profile page after sign in |
| **Actual Behavior** | Display name is missing or blank in both locations |
| **Root Cause** | App does not properly load profile data from database after authentication |
| **Fix Applied** | Not fixed |
| **Lesson Learned** | Always load complete user profile data when they sign in. Fetch all necessary data right after authentication |