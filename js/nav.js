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
  $navSubmit,
  $newStoryForm,
  $favoriteStories,
  $navFavorites
} from "./dom";
import { hidePageComponents } from "./main";
import {
  putStoriesOnPage,
  putFavoritesOnPage
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

  $navSubmit.classList.remove("d-none");
  $navFavorites.classList.remove("d-none");
  $navLogOut.classList.remove("d-none");
  $navUserProfile.classList.remove("d-none");
  $navUserProfile.querySelector("a").innerHTML = `${currentUser.username}`;
}

/** Display new story form on click on "submit" in nav bar */

export function navSubmitClick(evt){
  console.debug("navSubmitClick", evt);
  evt.preventDefault();
  hidePageComponents();

  $newStoryForm.classList.remove("d-none");
}

$navSubmit.addEventListener("click", navSubmitClick);

/** Display the current user's favorite stories
 *
 * If clicked for the first time, get and generate favorites
 * Otherwise, unhide favorite stories
*/

export function navFavoritesClick(evt){
  console.debug("navFavoritesClick", evt);
  evt.preventDefault();
  hidePageComponents();

  if($favoriteStories.hasChildNodes() === false ){
    putFavoritesOnPage();
  }
  $favoriteStories.classList.remove("d-none");
}

$navFavorites.addEventListener("click", navFavoritesClick);
