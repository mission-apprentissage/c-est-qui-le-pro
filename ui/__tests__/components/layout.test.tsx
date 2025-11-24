import { render, screen } from "@testing-library/react";
import { act } from "react";

import Layout from "#/app/components/Layout";

jest.mock("next/navigation", () => {
  return {
    __esModule: true,
    usePathname: () => ({ pathname: "" }),
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }),
    useSearchParams: () => ({ get: () => {} }),
    useServerInsertedHTML: jest.fn(),
  };
});

describe("Layout", () => {
  it("renders a layout", async () => {
    await act(async () =>
      render(
        <Layout title="test">
          <></>
        </Layout>
      )
    );
  });

  it("render the children", async () => {
    await act(async () =>
      render(
        <Layout title="test">
          <div data-testid="children" />
        </Layout>
      )
    );

    const children = screen.getByTestId("children");
    expect(children).toBeInTheDocument();
  });
});
