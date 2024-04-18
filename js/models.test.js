/** These tests use the axios-mock-adapter library to generate
 *  a "mock" version of axios itself. This mock version of axios
 *  will not make real API calls. Instead, it will fake the
 *  request/response, returning data that we pre-define.
 *
 *  Using the mocked version of axios allows us to do two important things:
 * - test our class methods as they are written
 * - not depend on live data from the real API (which may change!) in our tests
 *
 *  Mocking is a concept we will cover in more depth later in the cohort.
 *  This is for exposure, not mastery!
 */

import { beforeEach, describe, expect, test } from "vitest";
import { BASE_URL, Story, StoryList, User } from "./models";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// We declare the data we will use for requests/responses
// in our mocked API calls:
const STORY_1 = {
  author: "Test User",
  createdAt: "2020-01-01",
  storyId: "1",
  title: "Test Story",
  updatedAt: "2023-02-01",
  url: "https://test-story.com/",
  username: "testUser",
};

const STORY_2 = {
  author: "Test User 2",
  createdAt: "2020-01-01",
  storyId: "2",
  title: "Test Story 2",
  updatedAt: "2020-01-01",
  url: "https://teststory2.com/",
  username: "testUser2",
};

const USER_1 = {
  createdAt: "2020-01-01",
  favorites: [],
  name: "Test User",
  ownStories: [],
  updatedAt: "2020-01-01",
  username: "testUser",
};

const USER_2 = {
  createdAt: "2020-01-01",
  favorites: [],
  name: "Test User 2",
  ownStories: [],
  updatedAt: "2020-01-01",
  username: "testUser2",
};

const USER_SIGNUP_DATA = {
  createdAt: "2020-01-01",
  favorites: [],
  name: "Test Signup User",
  ownStories: [],
  updatedAt: "2020-01-01",
  username: "testSignupUser",
};

const LOGIN1_RESP = { user: USER_1, token: "test-user-1-token" };
const LOGIN2_RESP = { user: USER_2, token: "test-user-2-token" };

/** Mock a backend server endpoint. */
function mock(method, path, data, status = 200) {
  mockServer.use(
    http[method](`${BASE_URL}/${path}`, () =>
      HttpResponse.json(data, { status: status }),
    ),
  );
}

const mockServer = setupServer();
mockServer.listen();

// ====================================================================== Story

describe("Story", function () {
  beforeEach(function () {
    mock("get", "stories/1", { story: STORY_1 });
  });

  test("getStory", async function () {
    const story = await Story.getStory("1");
    expect(story).toEqual(new Story(STORY_1));
  });

  test("getHostName", function () {
    const story = new Story(STORY_1);
    expect(story.getHostName()).toEqual("test-story.com");
  });
});

// ================================================================== StoryList

describe("StoryList", function () {
  let user1;
  let user2;
  let storyList;
  let story1;
  let story2;

  beforeEach(async function () {
    mock("get", "stories", { stories: [] });
    mock("delete", "stories/1", { id: "1" });
    storyList = await StoryList.getStories();

    mock("post", "login", LOGIN1_RESP);
    user1 = await User.login("testUser", "password");

    mock("post", "login", LOGIN2_RESP);
    user2 = await User.login("testUser", "password");

    mock("post", "stories", { story: STORY_1 });
    story1 = await storyList.addStory(user1, STORY_1);

    mock("post", "stories", { story: STORY_2 });
    story2 = await storyList.addStory(user2, STORY_2);
  });

  test("getStories", async function () {
    expect(storyList.stories).toEqual([story2, story1]);
  });

  test("addStory", async function () {
    expect(storyList.stories).toEqual([story2, story1]);
    expect(user1.ownStories).toEqual([story1]);
    expect(user2.ownStories).toEqual([story2]);
  });

  test("removeStory", async function () {
    await storyList.removeStory(user1, "1");
    expect(storyList.stories).toEqual([story2]);
    expect(user1.ownStories).toEqual([]);
  });
});

// ======================================================================= User

describe("User", function () {
  let user;
  let storyList;
  let story;

  beforeEach(async function () {
    mock("get", "stories", { stories: [] });
    mock("delete", "stories/1", { id: "1" });
    mock("post", "login", LOGIN1_RESP);
    mock("post", "stories", { story: STORY_1 });
    mock(
      "post",
      "users/testUser/favorites/1",
      {
        message: "Favorite Added Successfully!",
        user: { username: "testUser", favorites: [STORY_1] },
      },
      201,
    );
    mock("delete", "users/testUser/favorites/1", {
      message: "Favorite Deleted Successfully!",
      user: {
        username: "testUser",
        favorites: [],
      },
    });
    mock("get", "users/testUser", { user: USER_1 });

    storyList = await StoryList.getStories();
    user = await User.login("testUser", "password");
    story = await storyList.addStory(user, STORY_1);
  });

  test("signup", async function () {
    mock("post", "signup", {
      token: "test-signup-user-token",
      user: {
        createdAt: "2020-01-01",
        favorites: [],
        name: "Test Signup User",
        stories: [],
        updatedAt: "2020-01-01",
        username: "testSignupUser",
      },
    });
    const user = await User.signup(
      "testSignupUser",
      "password",
      "Test Signup User",
    );
    expect(user).toEqual(new User(USER_SIGNUP_DATA, "test-signup-user-token"));
  });

  test("login", async function () {
    expect(user).toEqual(
      new User(
        {
          ...USER_1,
          ownStories: [new Story(STORY_1)],
        },
        "test-user-1-token",
      ),
    );
  });

  test("loginViaStoredCredentials with valid token", async function () {
    const user = await User.loginViaStoredCredentials(
      "test-user-token",
      "testUser",
    );
    expect(user).toEqual(new User(USER_1, "test-user-token"));
  });

  test("loginViaStoredCredentials with invalid token", async function () {
    mock(
      "get",
      "users/testUser",
      {
        err: {
          status: 401,
          title: "Unauthorized",
          message: "Missing or invalid auth token.",
        },
      },
      401,
    );

    const user = await User.loginViaStoredCredentials(
      "invalid-token",
      "testUser",
    );
    expect(user).toEqual(null);
  });

  test("addFavorite", async function () {
    await user.addFavorite(story);
    expect(user.favorites).toEqual([story]);
  });

  test("removeFavorite", async function () {
    expect(user.favorites).toEqual([]);

    await user.addFavorite(story);
    expect(user.favorites).toEqual([story]);

    await user.removeFavorite(story);
    expect(user.favorites).toEqual([]);
  });

  test("isFavorite", async function () {
    expect(user.isFavorite(story)).toEqual(false);
    await user.addFavorite(story);
    expect(user.isFavorite(story)).toEqual(true);
  });
});
