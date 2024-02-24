import pandas as pd
import json

# Read the JSON file
with open('verified_emails.json') as file:
    data = json.load(file)

# Create two lists to store the values of specified keys
email = []
password = []
profile = []

# Iterate over each item in the JSON data
for item in data:
    # Get the values of the specified keys
    profile.append(item.get('profile'))
    email.append(item.get('email'))
    password.append(item.get('password'))


# Create a DataFrame from the values of the specified keys
df = pd.DataFrame({'Email': email, 'Profile': profile})

# Save the DataFrame to an Excel file
df.to_csv('output.csv', index=False)
print("Exported successfully")

