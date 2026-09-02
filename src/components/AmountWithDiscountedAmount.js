import { Typography } from "@mui/material";
import {
	getAmountWithSign,
	getDiscountedAmount,
} from "../helper-functions/CardHelpers";
import { getCurrentModuleType } from "../helper-functions/getCurrentModuleType";
import { ModuleTypes } from "../helper-functions/moduleTypes";
import { Stack } from "@mui/system";

const AmountWithDiscountedAmount = ({ item, noPrimaryColor }) => {
	const moduleWiseLayout = () => {
		if (getCurrentModuleType() === ModuleTypes.FOOD) {
			const isDiscounted =
				getDiscountedAmount(
					item?.price,
					item?.discount,
					item?.discount_type,
					item?.store_discount,
					item?.quantity
				) !== item?.price;
			return (
				<Stack direction="row" alignItems="baseline" spacing={1}>
					{isDiscounted && (
						<Typography
							fontWeight="400"
							color="text.secondary"
							component="span"
							sx={{ fontSize: { xs: "16px", sm: "18px" }, lineHeight: 1 }}
						>
							<del>{getAmountWithSign(item?.price)}</del>
						</Typography>
					)}
					<Typography
						variant="h5"
						color={noPrimaryColor ? "red" : "primary.main"}
						component="span"
						sx={{
							fontSize: { xs: "18px", sm: "20px" },
							lineHeight: 1,
							color: (theme) =>
								getCurrentModuleType() === ModuleTypes.FOOD
									? theme.palette.moduleTheme.food
									: theme.palette.primary.main,
						}}
						fontWeight={isDiscounted ? 600 : 400}
					>
						{getAmountWithSign(
							getDiscountedAmount(
								item?.price,
								item?.discount,
								item?.discount_type,
								item?.store_discount,
								item?.quantity
							)
						)}
					</Typography>
				</Stack>
			);
		} else {
			const isDiscounted =
				getDiscountedAmount(
					item?.price,
					item?.discount,
					item?.discount_type,
					item?.store_discount,
					item?.quantity
				) !== item?.price;
			return (
				<Stack direction="row" alignItems="baseline" spacing={1}>
					<Typography
						variant="h5"
						component="span"
						sx={{
							fontSize: { xs: "18px", sm: "20px" },
							lineHeight: 1,
							color: (theme) =>
								noPrimaryColor ? "inherit" : theme.palette.primary.main,
						}}
						fontWeight={isDiscounted ? 600 : 400}
					>
						{getAmountWithSign(
							getDiscountedAmount(
								item?.price,
								item?.discount,
								item?.discount_type,
								item?.store_discount,
								item?.quantity
							)
						)}
					</Typography>
					{isDiscounted && (
						<Typography
							fontWeight="400"
							color="text.secondary"
							component="span"
							sx={{ fontSize: { xs: "16px", sm: "18px" }, lineHeight: 1 }}
						>
							<del>{getAmountWithSign(item?.price)}</del>
						</Typography>
					)}
				</Stack>
			);
		}
	};
	return <>{moduleWiseLayout()}</>;
};

AmountWithDiscountedAmount.propTypes = {};

export default AmountWithDiscountedAmount;

