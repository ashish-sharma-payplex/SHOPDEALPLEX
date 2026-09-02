import {
	alpha,
	Grid,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
	TextField,
	Button,
} from "@mui/material";
import { Box } from "@mui/system";
import CustomContainer from "../../container";
import { StyledFooterTop } from "../Footer.style";
import SubscribeImage from "./SubscribeImage";
import nwsltr from "../../landing-page/imgs/nwsltr.jpg";
import Subscribe from "./Subscribe"

const FooterTop = (props) => {
	const { landingPageData } = props;

	const theme = useTheme();
	const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

	return (
		<StyledFooterTop>
			<CustomContainer>
				<Box
					sx={{
						backgroundImage: `url(${nwsltr.src})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						backgroundRepeat: "no-repeat",
						borderRadius: "10px",
						padding: "30px",
						color: "white",
						textAlign: "center",
					}}
				>
					<Grid
						container
						alignItems="center"
						justifyContent="center"
						sx={{ height: "100%" }}
					>
						<Grid item xs={12} md={6}>
							<Typography fontWeight={700} fontSize={{ xs: "1.5rem", md: "2.5rem" }}>
								Stay Updated with Our Newsletter
							</Typography>
							<Typography
								variant="body1"
								sx={{ mt: 1, mb: 3, opacity: 0.8 }}
							>
								Subscribe to receive the latest news and updates.
							</Typography>
						</Grid>
						<Grid item xs={12} md={6}>
							
								<Subscribe/>
							
						</Grid>
					</Grid>
				</Box>
			</CustomContainer>
		</StyledFooterTop>
	);
};

export default FooterTop;
