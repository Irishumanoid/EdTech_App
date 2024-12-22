import * as React from 'react';
import Image from 'next/image';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Divider, Stack, Slider, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useRef } from 'react';
import Cropper from 'react-easy-crop'
import { getCroppedImg, PixelCrop } from '@/lib/utils';

interface ProfileUpdaterProps {
    open: boolean,
    onClose: () => void,
}

export const ProfileUpdater = ({ open, onClose }: ProfileUpdaterProps) => {
    const [image, setImage] = useState('/placeholder_person.jpg');
    const [imBuffer, setImBuffer] = useState<ArrayBuffer | null>(null);
    const [fileType, setFileType] = useState('');
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [enableCrop, setEnableCrop] = useState(false);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && ['image/jpg', 'image/jpeg', 'image/png', 'image/svg'].includes(file.type)) {
        const url = URL.createObjectURL(file);
        setImage(url);
        setFileType(file.type);

        const arrayBuffer = await file.arrayBuffer();
        setImBuffer(arrayBuffer);
      }
    }

    const handleUpload = () => {
      imageInputRef.current?.click();
      setEnableCrop(true);
    }

    const onCropComplete = async (croppedArea: any, croppedAreaPixels: PixelCrop) => {
      setCroppedAreaPixels(croppedAreaPixels);
    };
    

    const handleClose = async () => {
      setEnableCrop(false);
      try {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels as PixelCrop);
        if (croppedImage) {
          const response = await fetch(croppedImage);
          const blob = await response.blob();
          setImBuffer(await blob.arrayBuffer());
          setImage(croppedImage as string);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const updateState = async () => {
      const userId = localStorage.getItem('userId');
      const formData = new FormData();
      
      if (imBuffer) {
        const blob = new Blob([imBuffer], { type: fileType });
        formData.append('image', blob);

        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'type': 'image', 'userId': userId as string, 'filetype': fileType },
          body: formData
        });
      }

      if (bio !== '') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'type': 'bio', 'userId': userId as string, bio: bio }
        });
      }

      if (username !== '') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'type': 'username', 'userId': userId as string, username: username }
        });
      }
    }

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
                    <Image src={image} alt='profile picture' width={120} height={170}/>
                    <Dialog
                      onClose={handleClose}
                      aria-labelledby="customized-dialog-title"
                      open={enableCrop}
                    >
                      <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={(theme) => ({
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          color: (theme) => theme.palette.primary.main,
                        })}
                      >
                        <CloseIcon />
                      </IconButton>
                      <DialogContent dividers sx={{width: '300px', height: '400px'}}>
                        <Stack spacing={2}>
                          <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={3 / 4}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                          />
                          <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e, zoom) => setZoom(zoom as number)}
                          />
                        </Stack>
                      </DialogContent>
                      <DialogActions>
                        <Button autoFocus onClick={handleClose}>
                          Save changes
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Box>
                      <input ref={imageInputRef} onChange={handleImageChange} type='file' style={{ display: 'none' }}/>
                      <Button onClick={() => handleUpload()}>
                        Upload image
                      </Button>
                    </Box>
                </Box>
                <Box>
                    <DialogContent>
                    <DialogContentText> Set new username </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="outlined-multiline-flexible"
                        multiline
                        name="username"
                        label="Username"
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
              <Button type="submit" onClick={updateState}>Update</Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      );
}