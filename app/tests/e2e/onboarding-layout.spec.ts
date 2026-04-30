import { expect, test } from "@playwright/test";
import {
  adminClient,
  cleanupDoctor,
  provisionDoctor,
  signInViaMagicLink,
  uniqueEmail,
  type DoctorHandle,
} from "./helpers/auth";

test.describe("onboarding layout", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let doctor: DoctorHandle | undefined;

  test.afterEach(async () => {
    if (!doctor) return;
    await cleanupDoctor(adminClient(), doctor);
    doctor = undefined;
  });

  test("keeps the name-step Continue button close to the completed form on mobile", async ({
    page,
    baseURL,
  }) => {
    const admin = adminClient();
    const email = uniqueEmail("onboarding-layout");
    doctor = await provisionDoctor(admin, email, {
      fullName: "Balachandar Seeman",
      locale: "in",
      onboardingCompleted: false,
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await signInViaMagicLink(page, email, baseURL, "in");
    await page.goto("/in/onboarding");

    await expect(
      page.getByRole("heading", { name: /what should we call you/i }),
    ).toBeVisible();

    const lastName = page.locator("#last-name");
    await lastName.fill("Seeman");

    const continueButton = page.getByRole("button", { name: /continue/i });
    const lastNameBox = await lastName.boundingBox();
    const buttonBox = await continueButton.boundingBox();

    expect(lastNameBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    const formToButtonGap =
      buttonBox!.y - (lastNameBox!.y + lastNameBox!.height);

    expect(formToButtonGap).toBeLessThanOrEqual(160);
  });
});
