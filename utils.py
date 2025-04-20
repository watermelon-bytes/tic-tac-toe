def convertPositionForML(data: dict) -> dict:
    if not isinstance(data, dict):
        raise ValueError("Input must be a dictionary!")

    alphabet = ['a', 'b', 'c', 'd']
    new_data = {}

    for key, value in data.items():
        # key is like 'a1', 'b2', etc.
        row = key[0]
        if row not in alphabet:
            raise ValueError(f"Unexpected key format: {key}")
        new_key = key  # или: f"{alphabet[alphabet.index(row)]}{key[1]}"
        
        if value is True:
            new_val = 1
        elif value is None:
            new_val = 0
        elif value is False:
            new_val = -1

        new_data[new_key] = new_val

    return new_data
