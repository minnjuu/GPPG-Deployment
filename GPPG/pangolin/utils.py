import os


def delete_file(file_field):
    """Deletes the file from the filesystem if it exists."""
    if file_field and os.path.isfile(file_field.path):
        os.remove(file_field.path)


def delete_old_file(instance, new_file_field, old_file_field_name):
    """Deletes the old file from the filesystem when updating with a new file."""
    old_file = getattr(instance, old_file_field_name)
    if old_file and old_file != new_file_field:
        delete_file(old_file)
