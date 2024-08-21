import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Layout from "#/app/components/Layout";

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
