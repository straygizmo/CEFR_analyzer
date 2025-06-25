# 指定したファイルに1行1項目で書かれた正規表現で同一ディレクトリ内にあるXML形式に変換したPOSタグ・レマ付きデータ(*.xml)を検索して集計するスクリプト
# last modified: 3/6/2018
# usage: perl count.pl [正規表現のファイル]

$id = 0;

if ($#ARGV != 0) {
	die "usage perl count.pl [REGEX]\n"
}

open (REGEX, "$ARGV[0]") or die "cannot open $ARGV[0]\nusage perl count_pattern.pl [REGEX]\n";
open (COUNT, ">count.txt");

print COUNT "ID";

@files = glob "*.xml";
foreach $file (@files) {
	open(XML, $file);
	@xmlfile = <XML>;
	close XML;
	$data_xml{$file} = [ @xmlfile ];
	$filename = $file;
	$filename =~ s/^TreeTagged_?|\.xml$//g;
	print COUNT "\t$filename";
}
print COUNT "\n";

while (<REGEX>) {
	chomp;
	$regex = $_;
	$id++;
	print "processing $id...\n";
	print COUNT "$id";
	foreach $file (@files) {
		$count = 0;
		foreach (@{$data_xml{$file}}) {
			chomp;
			while (/$regex/ig) {
				$count++;
			}
		}
		print COUNT "\t$count";
	}
	print COUNT "\n";
}

close REGEX;
close COUNT;

exit (0);
