package utils

import (
	"bytes"
	"encoding/binary"
	"log"
)

func IntToHex(n int64) []byte {
	buf := new(bytes.Buffer)
	err := binary.Write(buf, binary.BigEndian, n)
	if err != nil {
		log.Panic(err)
	}
	return buf.Bytes()
}
