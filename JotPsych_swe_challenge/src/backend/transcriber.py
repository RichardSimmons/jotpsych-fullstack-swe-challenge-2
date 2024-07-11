from pydub import AudioSegment
from pydub.utils import which
import speech_recognition as sr
import os

# Manually set paths for ffmpeg and ffprobe

#AudioSegment.converter = which(r"C:\Users\fowl_\Desktop\JotPsych swe challenge\src\backend\venv\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe")
#AudioSegment.ffprobe = which(r"C:\Users\fowl_\Desktop\JotPsych swe challenge\src\backend\venv\ffmpeg-master-latest-win64-gpl\bin\ffprobe.exe")

def convert_webm_to_wav(input_webm_path, output_wav_path):
    audio = AudioSegment.from_file(input_webm_path, format="webm")
    audio.export(output_wav_path, format="wav")

def transcribe_audio_local(audio_file_path):
    temp_audio_path = "temp_audio.wav"
    convert_webm_to_wav(audio_file_path, temp_audio_path)  # Convert to WAV temporarily

    recognizer = sr.Recognizer()
    with sr.AudioFile(temp_audio_path) as source:
        audio = recognizer.record(source)
    transcript = recognizer.recognize_google(audio)
    
    # remove the temporary WAV file
    if os.path.exists(temp_audio_path):
        os.remove(temp_audio_path)

    return transcript

# Usage example
audio_file_path = "api/audio_files/recorded_audio.webm"
try:
    transcript = transcribe_audio_local(audio_file_path)
    print(transcript)
except Exception as e:
    print(f"Error during transcription: {e}")