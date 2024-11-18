import { Checkbox, FormControlLabel } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useAppDispatch } from  '../../store/hooks';
import { addPlot, removePlot } from '../../store/features/userStorySlice';
import { useState } from 'react';

interface CheckboxGridProps {
    numCols: number,
    entries: string[],
}

export const CheckboxGrid = ({ numCols, entries }: CheckboxGridProps) => {
    const dispatch = useAppDispatch();

    const handleCheckbox = (checked: boolean, value: string) => {
        if (checked) {
            dispatch(addPlot(value));
        } else {
            dispatch(removePlot(value));
        }
    }

    return (
        <div>
            <Grid container spacing={1} alignItems="center" justifyContent="flex-start">
                {entries.map((entry, index) => (
                    <Grid key={index} size={12 / numCols}>
                        <FormControlLabel
                            control={<Checkbox onChange={e => handleCheckbox(e.target.checked, entry)}/>}
                            label={entry}
                            style={{ display: 'flex', alignItems: 'center' }}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};
