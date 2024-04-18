"use strict";

// global to hold the User instance of the currently-logged-in user
import { User } from "./models";
import {
  $allStoriesList,
  $loginForm,
  $navLogOut,
  $signupForm,
} from "./dom";
import { hidePageComponents } from "./main";
import { putStoriesOnPage } from "./stories";
import { updateNavOnLogin } from "./nav";

export let currentUser;

/******************************************************************************
 * User login/signup/login
 *****************************************************************************/

/** Handle login form submission.
 *
 * If login is successful:
 * - save credentials in localStorage
 * - update UI
 * - store logged-in-user in currentUser
 *
 * If not:
 * - Show error message in DOM
 */

export async function handleLogin(evt) {
  console.debug("handleLogin", evt);
  evt.preventDefault();

  const qs = $loginForm.querySelector.bind($loginForm);
  const $failMsg = qs("#LoginForm-fail");
  $failMsg.classList.add("d-none");

  // grab the username and password
  const username = qs("#LoginForm-username").value;
  const password = qs("#LoginForm-password").value;

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.login(username, password);
  } catch (err) {
    $failMsg.classList.remove("d-none");
    $failMsg.innerHTML = err.message;
    console.error(evt);
    return;
  }

  $loginForm.reset();

  saveUserCredentialsInLocalStorage();
  await updateUIOnUserLogin();
}

$loginForm.addEventListener("submit", handleLogin);

/** Handle signup form submission. */

export async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const qs = $signupForm.querySelector.bind($signupForm);
  const $failMsg = qs("#SignupForm-fail");
  $failMsg.classList.add("d-none");

  const name = qs("#SignupForm-name").value;
  const username = qs("#SignupForm-username").value;
  const password = qs("#SignupForm-password").value;

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.signup(username, password, name);
  } catch (err) {
    $failMsg.classList.remove("d-none");
    $failMsg.innerHTML = err.message;
    console.error(evt);
    return;
  }

  saveUserCredentialsInLocalStorage();
  await updateUIOnUserLogin();

  $signupForm.reset();
}

$signupForm.addEventListener("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

export function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.addEventListener("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

export async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

export function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users & profiles
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

export async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  hidePageComponents();

  // re-display stories (so that "favorite" stars can appear)
  putStoriesOnPage();
  $allStoriesList.classList.remove("d-none");

  updateNavOnLogin();
}
