"use client";
import Container from "#/app/components/Container";
import SearchFormationHomeForm from "#/app/components/form/SearchFormationHomeForm";
import { Box, Grid } from "#/app/components/MaterialUINext";

export default function SearchHeader() {
  return (
    <Container nopadding={true} maxWidth={false} style={{ paddingLeft: 0, paddingRight: 0 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <Box
          sx={{
            maxWidth: "78rem",
            width: "100%",
            paddingLeft: "1rem",
            paddingRight: {
              xl: "1rem",
              lg: "1rem",
              xs: "1rem",
            },
          }}
        >
          <SearchFormationHomeForm
            url={"/recherche"}
            defaultValues={{ address: null, distance: 0, time: 90 }}
            bordered
            withFormation={true}
          />
        </Box>
      </Box>
    </Container>
  );
}
