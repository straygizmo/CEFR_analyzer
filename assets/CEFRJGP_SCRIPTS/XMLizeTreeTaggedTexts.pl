# 同一ディレクトリ内にあるTreeTagger処理済の任意のテキストデータ（TreeTagged*.txt）を対象に「表記形_品詞_タグ」で1文1行（擬似的）形式のwell-formed XMLにするスクリプト
# last modified: 2/23/2020
# usage: perl XMLizeTreeTaggedTexts.pl

# 処理済ファイルを出力するフォルダを作成
if (!-d ".\\TreeTaggedXML"){
	mkdir ".\\TreeTaggedXML";
}

@files = glob "TreeTagged*.txt";
foreach $filein (@files) {
	$fileout = $filein;
	$fileout =~ s/\.txt$/.xml/;
	open(IN, $filein);
	open (OUT, ">TreeTaggedXML\\$fileout");
	$line = "";	# $lineは前行までで未出力の内容を蓄積する変数
	print OUT "<file>\n";
	while (<IN>) {
		chomp;
		 s/^\xef\xbb\xbf//;;	# ICNALE用；BOMの削除
		if (/^<g\/>$/) {	# ICNALE用
			next;
		} elsif (/^</) {	# 教科書コーパス・ICNALE用；タグはそのまま出力する
			if ($line ne "") {
				$line =~ s/^\s//;
				print OUT $line . "\n";
				$line = "";
			}
			print OUT $_ . "\n";
			next;
		}
		s/-[acdijmnprvx]$//;	# ICNALE用
		s/&/&amp;/g;
		s/>/&gt;/g;
		s/</&lt;/g;
		s/\t/_/g;
		# 擬似的なsentence segmentation（TreeTaggerにsentence segmentationの機能がないため）
		# [.!?]の次の行が大文字始まりだった場合に限って文境界として改行を入れる
		if ($line =~ / [.!?]_SENT_[.!?]$/) {
			if (/^[A-Z]/) {
				$line =~ s/^\s//;
				print OUT $line . "\n";
				$line = $_;
			} else {
				$line .= " " . $_;
			}
		} else {
			$line .= " " . $_;
		}
	}
	print OUT $line . "\n";
	print OUT "</file>\n";
	close IN;
	close OUT;
}

exit (0);
