/******************************************************************************
 * Handling navbar clicks and updating navbar
 *****************************************************************************/

import {
  $navAllStories,
  $navLogin,
  $navLogOut,
  $navUserProfile,
  $loginForm,
  $signupForm,
} from "./dom";
import { hidePageComponents } from "./main";
import {
  putStoriesOnPage,
} from "./stories";
import { currentUser } from "./user";

/** Show main list of all stories when click site name */

export function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$navAllStories.addEventListener("click", navAllStories);

/** Show login/signup on click on "login" */

export function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.classList.remove("d-none");
  $signupForm.classList.remove("d-none");
}

$navLogin.addEventListener("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

export function updateNavOnLogin() {
  console.debug("updateNavOnLogin");

  $navLogin.classList.add("d-none");

  $navLogOut.classList.remove("d-none");
  $navUserProfile.classList.remove("d-none");
  $navUserProfile.querySelector("a").innerHTML = `${currentUser.username}`;
}
