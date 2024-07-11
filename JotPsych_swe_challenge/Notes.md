Project Summary: Audio Recorder with Encryption and Transcription
Overview
In this project, I built a comprehensive audio recording application, incorporating encryption for secure storage of user mottos, transcription capabilities for audio files, and visual enhancements for usability. The project consists of a backend application using Flask and a frontend application using React.

Key Features Implemented
1. Audio Recording and Transcription:
   - Built an audio recorder in `AudioRecorder.tsx` that allows users to record audio, upload it for transcription, and save it locally.
   - Implemented a local transcriber in `transcriber.py` using the `SpeechRecognition` library but did not fully integrate it into the application.
2. Encryption for Mottos:
   - Used Fernet symmetric encryption to securely store user mottos.
3. Asynchronous Audio Processing with Celery:
   - Implemented asynchronous tasks using Celery for processing audio files.
4. Visual Enhancements:
   - Added visual cues to the Start and Stop buttons to improve usability.
   - Implemented an audio visualizer to display waveforms during recording.
5. Save Locally Button:
   - Added a "Save Locally" button to enable users to save their recordings to their local machine.




Implementation Details

Encryption Implementation
- Reason for Encryption: Secure storage of user data is paramount, especially for sensitive information like personal mottos.
- Choice of Encryption Method: I used Fernet encryption from the `cryptography` library because:
  - It provides symmetric encryption, suitable for secure storage.
  - It includes both encryption and authentication to prevent tampering.
- Key Management: The encryption key is generated or loaded from a file (`encryption_key.key`) for consistent encryption and decryption.

Audio Visualizer in `AudioRecorder.tsx
Reasoning:
- An audio visualizer provides immediate feedback to users, improving the recording experience.

Visual Cues and Save Locally Button
- Start/Stop Button Colors: Green and Red colors for Start and Stop buttons make the interface intuitive and visually clear.
- Save Locally Button: Providing a way to save the recording locally increases user control over their data.

External Resources Used
MUI styling guidelines
Visual Studio Code
Audio Programming Book

Conclusion
- Implemented secure encryption for user mottos using Fernet encryption.
- Integrated Celery to handle audio tasks asynchronously.
- Built a local transcriber with `SpeechRecognition` but didn't fully integrate it.
- Enhanced the user interface with visual cues for better usability.
- Added an option to save audio recordings locally for user convenience.
- Provided an audio visualizer to display audio waveforms in real time during recording.
