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
    const [numChecked, setNumChecked] = useState(0);
    const [states, setStates] = useState(new Map(Array.from(entries).map(key => [key, false])));

    const handleCheckbox = (checked: boolean, value: string) => {
        const newStates: Map<string, boolean> = states;
        if (checked) {
            if (numChecked < 5) {
                dispatch(addPlot(value));
                setNumChecked(numChecked + 1);
                newStates.set(value, true);
            }
        } else {
            dispatch(removePlot(value));
            setNumChecked(numChecked - 1);
            newStates.set(value, false);
        }
        setStates(newStates);
    }

    return (
        <div>
            <Grid container spacing={1} alignItems="center" justifyContent="flex-start">
                {entries.map((entry, index) => (
                    <Grid key={index} size={12 / numCols}>
                        <FormControlLabel
                            control=
                                {<Checkbox checked={states.get(entry)} onChange={e => handleCheckbox(e.target.checked, entry)}/>}
                            label={entry}
                            style={{ display: 'flex', alignItems: 'center' }}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};
