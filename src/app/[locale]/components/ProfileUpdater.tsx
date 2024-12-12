import * as React from 'react';
import Image from 'next/image';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Divider, Stack } from '@mui/material';
import { useState } from 'react';
  

interface ProfileUpdaterProps {
    open: boolean,
    onClose: () => void,
}

export const ProfileUpdater = ({ open, onClose }: ProfileUpdaterProps) => {
    const [image, setImage] = useState<typeof Image>();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');

    // if open is false and there is stuff in useStates has changed, fetch POST

    return (
        <React.Fragment>
          <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
              component: 'form',
              onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries((formData as any).entries());
                const email = formJson.email;
                console.log(email);
                onClose();
              },
            }}
          >
            <DialogTitle>Update Profile Information</DialogTitle>
            <Divider variant="middle" />
            <Stack direction='row'>
                <Box paddingBottom={10} paddingLeft={2}>
                    <Image src={'/placeholder_person.jpg'} alt='profile picture' width={200} height={50}/>
                    <DialogContentText> New profile picture </DialogContentText>
                </Box>
                <Box>
                    <DialogContent>
                    <DialogContentText> Set new username </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="email"
                        label="Username"
                        type="email"
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    </DialogContent>
                    <DialogContent>
                    <DialogContentText>
                        Write a quick description about yourself and your goals
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="outlined-multiline-flexible"
                        multiline
                        minRows={2}
                        maxRows={4}
                        name="email"
                        label="Profile information"
                        type="email"
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setBio(e.target.value)}
                    />
                    </DialogContent>
                </Box>
            </Stack>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="submit">Update</Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      );
}