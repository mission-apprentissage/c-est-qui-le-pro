"use client";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Box, Grid, Typography } from "@mui/material";
import Container from "@mui/material/Container";

export default function Error() {
  return (
    <Container>
      <Grid container direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={7}>
          <Typography sx={{ my: fr.spacing("6v"), mt: fr.spacing("28v") }} variant="h1">
            Erreur inatendue
          </Typography>
          <Typography sx={{ my: fr.spacing("6v") }} variant="body2">
            Erreur 500
          </Typography>
          <Typography variant="body1">
            Désolé, le service rencontre un problème, nous travaillons pour le résoudre le plus rapidement possible.
          </Typography>
          <Typography sx={{ mt: fr.spacing("6v") }} variant="body2">
            Essayez de rafraichir la page ou bien ressayez plus tard.
          </Typography>
          <Typography sx={{ mb: fr.spacing("12v") }} variant="body2">
            Si vous avez besoin d’une aide immédiate, merci de nous contacter directement.
          </Typography>
          <Box sx={{ mb: fr.spacing("28v") }}>
            {/* TODO: IMPLEMENT THE CONTACT BUTTON */}
            <Button priority="secondary">Contactez-nous</Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
