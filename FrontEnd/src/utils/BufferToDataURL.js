  const BufferToDataURL = (buffer, contentType) => {
    if (!buffer || !buffer.data) return null;

    // Convert buffer array to base64 string
    const base64 = btoa(
      buffer.data.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    return `data:${contentType};base64,${base64}`;
  }

  export default BufferToDataURL