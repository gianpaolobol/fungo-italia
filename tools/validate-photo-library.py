"""Technical checks only; fungal identifications are not validated."""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image
from jsonschema import Draft202012Validator, FormatChecker
ROOT = Path(__file__).resolve().parents[1] / 'photo-library'
def require(condition, message):
    if not condition:
        raise ValueError(message)
def main():
    index = ROOT / 'metadata.json'
    images = ROOT / 'images'
    if not index.exists():
        require(not images.exists() or not any(images.iterdir()), 'Images exist without metadata.json')
        print('SKIP: no metadata.json and no images; photo library is empty.')
        return
    require(not index.is_symlink(), 'Metadata must not be a symbolic link')
    require(index.stat().st_size <= 8 * 1024 * 1024, 'Metadata exceeds 8 MiB')
    schema_path = ROOT / 'schema.json'
    require(schema_path.is_file() and not schema_path.is_symlink(), 'Missing or invalid schema.json')
    schema = json.loads(schema_path.read_text(encoding='utf-8'))
    value = json.loads(index.read_text(encoding='utf-8'))
    Draft202012Validator.check_schema(schema)
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(value)
    require(len(value['photos']) <= 10000, 'Library exceeds 10000 records')
    seen_ids, seen_files = set(), set()
    for record in value['photos']:
        name, ident = record['file'], record['id']
        require(ident not in seen_ids and name not in seen_files, 'Duplicate record: '+ident)
        seen_ids.add(ident)
        seen_files.add(name)
        path = ROOT / name
        require(path.is_file() and not path.is_symlink(), 'Missing or linked image: '+name)
        require(path.resolve().is_relative_to(ROOT.resolve()), 'Path outside library')
        data = path.read_bytes()
        require(0 < len(data) <= 2 * 1024 * 1024, 'Invalid file size: '+name)
        require(hashlib.sha256(data).hexdigest() == record['sha256'], 'SHA256 mismatch: '+name)
        with Image.open(path) as image:
            require(image.format == 'JPEG', 'Not JPEG: '+name)
            width, height = image.size
            require(1 <= width <= 1600 and 1 <= height <= 1600, 'Invalid dimensions: '+name)
            require(record['dimensions'] == {'width': width, 'height': height}, 'Dimensions mismatch: '+name)
            require(not image.getexif() and not image.info.get('exif'), 'EXIF present: '+name)
            require(not image.info.get('comment') and not image.info.get('xmp'), 'Comment or XMP present: '+name)
            image.verify()
        with Image.open(path) as image:
            image.load()
    actual = set()
    if images.exists():
        for path in images.rglob('*'):
            require(not path.is_symlink(), 'Symbolic link in images')
            if path.is_file():
                actual.add(path.relative_to(ROOT).as_posix())
    require(actual == seen_files, 'Image directory and metadata records do not match')
    print('PASS: '+str(len(seen_files))+' images checked for schema, SHA256, size, dimensions and EXIF absence.')
    print('Taxonomic identifications and rights declarations were not independently validated.')
if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('FAIL: '+str(error), file=sys.stderr)
        sys.exit(1)
