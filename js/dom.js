// So we don't have to keep re-finding things on page, find DOM elements once:

export const $storiesLoadingMsg = document.querySelector("#LoadingMsg");
export const $allStoriesList = document.querySelector("#AllStoriesList");

// selector that finds all three story lists
export const $storiesLists = document.querySelector(".stories-list");

export const $loginForm = document.querySelector("#LoginForm");
export const $signupForm = document.querySelector("#SignupForm");

export const $navLogin = document.querySelector("#Nav-login");
export const $navUserProfile = document.querySelector("#Nav-userProfile");
export const $navLogOut = document.querySelector("#Nav-logout");
export const $navAllStories = document.querySelector("#Nav-all");
