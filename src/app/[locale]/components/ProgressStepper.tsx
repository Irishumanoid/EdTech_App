import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { Dispatch, Fragment, SetStateAction } from 'react';

export const steps = ['User information', 'Content settings', 'Plot archetypes', 'Additional information'];
interface ProgressStepperProps {
    activeStep: number,
    setActiveStep: Dispatch<SetStateAction<number>>
}

export const ProgressStepper = ({ activeStep, setActiveStep }: ProgressStepperProps) => {
    const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1 === steps.length ? prevActiveStep : prevActiveStep + 1);
    };

    const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
    <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep}>
        {steps.map((label) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
            optional?: React.ReactNode;
            } = {};
            return (
            <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
            );
        })}
        </Stepper>
        <Fragment>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
            >
                Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep !== steps.length - 1 &&
                <Button onClick={handleNext}>
                     Next
                </Button>
            }
            </Box>
        </Fragment>
    </Box>
    );
}
