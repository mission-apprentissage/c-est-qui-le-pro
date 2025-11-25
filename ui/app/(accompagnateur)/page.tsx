"use client";
import React, { Suspense } from "react";
import Image from "next/image";
import Container from "#/app/components/Container";
import { Grid, Typography } from "#/app/components/MaterialUINext";
import Button from "#/app/components/Button";
import SearchFormationHomeForm from "#/app/components/form/SearchFormationHomeForm";
import {
  MainContainer,
  MainTitle,
  MainTitleGrid,
  CitySuggestionStack,
  AddressButton,
  ImageGrid,
  HomeImage,
  LogoStack,
  PreviewImageBox,
  PreviewImage,
  BrMobile,
} from "./page.styled";
import { HighlightedText } from "./details/[id]/FormationSimilaire.styled";
import Link from "../components/Link";
import FocusSearchProvider, { useFocusSearchContext } from "./context/FocusSearchContext";
import { CITIES_SUGGESTION } from "../services/address";

function CitySuggestion() {
  const { focusField } = useFocusSearchContext();

  return (
    <CitySuggestionStack
      direction="row"
      spacing={2}
      sx={{ flexWrap: "wrap", justifyContent: { xs: "center", md: "normal" } }}
      useFlexGap
    >
      {CITIES_SUGGESTION.map((city) => (
        <Link
          key={city.text}
          noIcon
          noDecoration
          noActiveBg
          href={`recherche?address=${encodeURIComponent(city.address)}`}
        >
          <Button iconSize="lg" size="small" rounded variant="white" priority="tertiary no outline">
            <city.icon />
            {city.text}
          </Button>
        </Link>
      ))}
      <AddressButton
        iconOnly
        iconSize="lg"
        iconId="ri-arrow-right-line"
        size="small"
        rounded
        variant="white"
        priority="tertiary no outline"
        title="Mon adresse"
        onClick={() => focusField("address")}
      ></AddressButton>
    </CitySuggestionStack>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <MainContainer bgColor="blue">
        <Container nopadding maxWidth={"xl"}>
          <Grid container spacing={"3rem"}>
            <Grid item md={8} xs={12}>
              <MainTitleGrid xs={12}>
                <MainTitle variant="h1_main">
                  Toutes les formations pros accessibles après la 3<sup>e</sup>
                </MainTitle>
              </MainTitleGrid>

              <FocusSearchProvider>
                <SearchFormationHomeForm
                  isHomeSearch={true}
                  url={"/recherche"}
                  bordered
                  defaultValues={{ address: null }}
                />

                <CitySuggestion />
              </FocusSearchProvider>
            </Grid>
            <ImageGrid item xs={12} md={4}>
              <HomeImage
                width={0}
                height={0}
                sizes="100vw"
                src={"/assets/home_large.png"}
                alt={"Exemple de formations"}
              />
            </ImageGrid>
          </Grid>
        </Container>
      </MainContainer>

      <MainContainer bgColor="white">
        <Container nopadding maxWidth={"md"}>
          <LogoStack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Image src={"/assets/logo_futurpro.svg"} width="299" height="83" alt={"Logo CQLP"} />
            <Typography>et</Typography>
            <Image src={"/assets/logo_avenir.svg"} width="299" height="96" alt={"Logo Avenir"} />
          </LogoStack>
          <Typography align={"center"}>
            aident les accompagnateurs de l’orientation et les élèves de collège à découvrir les formations
            professionnelles les plus adaptées pour l’après 3ᵉ
          </Typography>
        </Container>
      </MainContainer>

      <MainContainer bgColor="blue" sx={{ display: { xs: "none", sm: "block" } }}>
        <Typography align={"center"} variant="h3">
          Accéder à des informations <HighlightedText>locales et récentes</HighlightedText>
        </Typography>
        <PreviewImageBox>
          <PreviewImage width={0} height={0} sizes="100vw" src={"/assets/preview.png"} alt={"Preview de CQLP"} />
        </PreviewImageBox>
      </MainContainer>

      <MainContainer bgColor="blue" sx={{ display: { sm: "none", xs: "block" } }}>
        <Typography align={"center"} variant="h3">
          Accéder à des informations <HighlightedText>locales et récentes</HighlightedText>
        </Typography>
        <PreviewImageBox>
          <PreviewImage width={0} height={0} sizes="100vw" src={"/assets/preview_mobile.png"} alt={"Preview de CQLP"} />
        </PreviewImageBox>
      </MainContainer>

      <MainContainer bgColor="blue" sx={{ display: { sm: "none", xs: "block" } }}>
        <Typography align={"center"} variant="h3">
          Visualiser des données <HighlightedText>utiles</HighlightedText>
        </Typography>
        <PreviewImageBox>
          <PreviewImage
            width={0}
            height={0}
            sizes="100vw"
            src={"/assets/preview_widget_mobile.png"}
            alt={"Preview de CQLP"}
          />
        </PreviewImageBox>
      </MainContainer>
    </Suspense>
  );
}
