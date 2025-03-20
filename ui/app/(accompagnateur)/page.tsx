"use client";
import React, { Suspense } from "react";
import Container from "#/app/components/Container";
import { Grid, Stack } from "#/app/components/MaterialUINext";
import Button from "#/app/components/Button";
import SearchFormationHomeForm from "#/app/components/form/SearchFormationHomeForm";
import {
  DescriptionText,
  InfoSectionGrid,
  MainContainer,
  MainTitle,
  MainTitleGrid,
  SearchFormGrid,
  SubTitle,
} from "./page.styled";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <MainContainer maxWidth={false}>
        <Container maxWidth={"lg"}>
          <Grid container spacing={0}>
            <MainTitleGrid xs={12}>
              <MainTitle variant="h1_main">
                Trouve toutes
                <br />
                les formations pro*
                <br />
                autour de toi
              </MainTitle>
            </MainTitleGrid>

            <SearchFormGrid md={9} xs={12}>
              <SearchFormationHomeForm isHomeSearch={true} url={"/recherche"} defaultValues={{ address: null }} />
            </SearchFormGrid>

            <InfoSectionGrid sm={12} md={6.5}>
              <SubTitle variant={"h2"}>*Voie Pro = Professionnelle. Ce n&apos;est pas si clair ?</SubTitle>
              <DescriptionText variant={"body2"}>
                Après la 3ᵉ, il est possible d&apos;apprendre un métier en CAP ou en bac pro, au sein d&apos;un lycée
                professionnel ou d&apos;un centre de formation d&apos;apprentis. À l&apos;issue de ce cursus,
                l&apos;élève diplômé pourra accéder directement à un emploi ou choisir de poursuivre ses études.
              </DescriptionText>
              <Stack direction={{ md: "row", xs: "column" }} spacing={"14px"}>
                <Button
                  linkProps={{
                    href: "https://www.onisep.fr/formation/apres-la-3-la-voie-professionnelle/qu-est-ce-que-la-voie-professionnelle",
                  }}
                  rounded={"4px"}
                  priority="secondary"
                  variant={"white-black"}
                >
                  Découvrir la voie pro au collège
                </Button>
                <Button
                  linkProps={{
                    href: "https://www.onisep.fr/formation/apres-la-3-la-voie-professionnelle/quiz-collegiens-que-savez-vous-de-la-voie-professionnelle",
                  }}
                  rounded={"4px"}
                  priority="secondary"
                  variant={"white-black"}
                >
                  Quiz voie pro
                </Button>
              </Stack>
            </InfoSectionGrid>
          </Grid>
        </Container>
      </MainContainer>
    </Suspense>
  );
}
