import React from 'react'
import {
    Stack,
    Typography,
    alpha,
    styled,
    useTheme,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { t } from 'i18next'

/* ---------------- styled components ---------------- */

const StepWrapper = styled(Stack)(() => ({
    flexDirection: 'row',
    gap: '18px',
    alignItems: 'center', // 👈 exact center alignment with image
}))

const StepIconWrapper = styled(Stack)(() => ({
    position: 'relative',
    alignItems: 'center',
    width: '56px',
    flexShrink: 0,
}))

const StepIcon = styled('img')(() => ({
    width: 52,
    height: 52,
    objectFit: 'contain',
    zIndex: 2,
}))

const StepLine = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: '52px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '2px',
    height: 'calc(100% + 20px)',
    borderLeft: `2px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
    zIndex: 1,
}))

/* ---------------- component ---------------- */

const HowItWorks = ({ configData }) => {
    const theme = useTheme()

    return (
        <Stack
            width="100%"
            maxWidth="100%"
            gap="22px"
            padding={{ xs: '16px 0px 16px 0px', sm: '22px' }}
            borderRadius="12px"
            // sx={{
            //     backgroundColor: alpha(theme.palette.primary.main, 0.05),
            // }}
        >
            {/* Header */}
            {/* <Stack direction="row" alignItems="center" gap="8px">
                <InfoOutlinedIcon sx={{ fontSize: 22 }} />
                <Typography fontSize="17px" fontWeight={700}>
                    {t('How it Works?')}
                </Typography>
            </Stack> */}

            {/* Steps */}
            <Stack gap="30px">
                {/* Step 1 */}
                <StepWrapper>
                    <StepIconWrapper>
                        <StepIcon src="/invite.png" />
                        <StepLine />
                    </StepIconWrapper>
                    <Typography
                    sx={{fontSize:{xs:"15px",sm:"17px"}}}
                        lineHeight="22px"
                        color="text.primary"
                    >
                        {t(
                            'Invite and share your code to your friends & family members'
                        )}
                    </Typography>
                </StepWrapper>

                {/* Step 2 */}
                <StepWrapper>
                    <StepIconWrapper>
                        <StepIcon src="/note.png" />
                        <StepLine />
                    </StepIconWrapper>
                    <Typography
                      sx={{fontSize:{xs:"15px",sm:"17px"}}}
                        lineHeight="22px"
                    >
                        {`${t('They create an account on')} ${
                            configData?.business_name
                        } ${t('using your code and place their first order')}`}
                    </Typography>
                </StepWrapper>

                {/* Step 3 */}
                <StepWrapper>
                    <StepIconWrapper>
                        <StepIcon src="/earning.png" />
                    </StepIconWrapper>
                    <Typography
                      sx={{fontSize:{xs:"15px",sm:"17px"}}}
                        lineHeight="22px"
                    >
                        {t('You made your earning when the order is complete')}
                    </Typography>
                </StepWrapper>
            </Stack>
        </Stack>
    )
}

export default HowItWorks
