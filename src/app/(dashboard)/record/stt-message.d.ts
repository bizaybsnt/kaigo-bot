import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace agora. */
export namespace agora {

    /** Namespace audio. */
    namespace audio {

        /** Namespace stt. */
        namespace stt {

            /** Properties of a Text. */
            interface IText {

                /** Text vendor */
                vendor?: (number|null);

                /** Text version */
                version?: (number|null);

                /** Text seqnum */
                seqnum?: (number|null);

                /** Text uid */
                uid?: (number|null);

                /** Text flag */
                flag?: (number|null);

                /** Text time */
                time?: (number|Long|null);

                /** Text lang */
                lang?: (number|null);

                /** Text starttime */
                starttime?: (number|null);

                /** Text offtime */
                offtime?: (number|null);

                /** Text words */
                words?: (agora.audio.stt.IWord[]|null);

                /** Text endOfSegment */
                endOfSegment?: (boolean|null);

                /** Text durationMs */
                durationMs?: (number|null);

                /** Text dataType */
                dataType?: (string|null);

                /** Text trans */
                trans?: (agora.audio.stt.ITranslation[]|null);

                /** Text culture */
                culture?: (string|null);
            }

            /** Represents a Text. */
            class Text implements IText {

                /**
                 * Constructs a new Text.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: agora.audio.stt.IText);

                /** Text vendor. */
                public vendor: number;

                /** Text version. */
                public version: number;

                /** Text seqnum. */
                public seqnum: number;

                /** Text uid. */
                public uid: number;

                /** Text flag. */
                public flag: number;

                /** Text time. */
                public time: (number|Long);

                /** Text lang. */
                public lang: number;

                /** Text starttime. */
                public starttime: number;

                /** Text offtime. */
                public offtime: number;

                /** Text words. */
                public words: agora.audio.stt.IWord[];

                /** Text endOfSegment. */
                public endOfSegment: boolean;

                /** Text durationMs. */
                public durationMs: number;

                /** Text dataType. */
                public dataType: string;

                /** Text trans. */
                public trans: agora.audio.stt.ITranslation[];

                /** Text culture. */
                public culture: string;

                /**
                 * Creates a new Text instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Text instance
                 */
                public static create(properties?: agora.audio.stt.IText): agora.audio.stt.Text;

                /**
                 * Encodes the specified Text message. Does not implicitly {@link agora.audio.stt.Text.verify|verify} messages.
                 * @param message Text message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: agora.audio.stt.IText, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Text message, length delimited. Does not implicitly {@link agora.audio.stt.Text.verify|verify} messages.
                 * @param message Text message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: agora.audio.stt.IText, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Text message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Text
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): agora.audio.stt.Text;

                /**
                 * Decodes a Text message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Text
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): agora.audio.stt.Text;

                /**
                 * Verifies a Text message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Text message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Text
                 */
                public static fromObject(object: { [k: string]: any }): agora.audio.stt.Text;

                /**
                 * Creates a plain object from a Text message. Also converts values to other types if specified.
                 * @param message Text
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: agora.audio.stt.Text, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Text to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Text
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a Word. */
            interface IWord {

                /** Word text */
                text?: (string|null);

                /** Word startMs */
                startMs?: (number|null);

                /** Word durationMs */
                durationMs?: (number|null);

                /** Word isFinal */
                isFinal?: (boolean|null);

                /** Word confidence */
                confidence?: (number|null);
            }

            /** Represents a Word. */
            class Word implements IWord {

                /**
                 * Constructs a new Word.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: agora.audio.stt.IWord);

                /** Word text. */
                public text: string;

                /** Word startMs. */
                public startMs: number;

                /** Word durationMs. */
                public durationMs: number;

                /** Word isFinal. */
                public isFinal: boolean;

                /** Word confidence. */
                public confidence: number;

                /**
                 * Creates a new Word instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Word instance
                 */
                public static create(properties?: agora.audio.stt.IWord): agora.audio.stt.Word;

                /**
                 * Encodes the specified Word message. Does not implicitly {@link agora.audio.stt.Word.verify|verify} messages.
                 * @param message Word message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: agora.audio.stt.IWord, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Word message, length delimited. Does not implicitly {@link agora.audio.stt.Word.verify|verify} messages.
                 * @param message Word message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: agora.audio.stt.IWord, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Word message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Word
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): agora.audio.stt.Word;

                /**
                 * Decodes a Word message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Word
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): agora.audio.stt.Word;

                /**
                 * Verifies a Word message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Word message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Word
                 */
                public static fromObject(object: { [k: string]: any }): agora.audio.stt.Word;

                /**
                 * Creates a plain object from a Word message. Also converts values to other types if specified.
                 * @param message Word
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: agora.audio.stt.Word, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Word to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Word
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a Translation. */
            interface ITranslation {

                /** Translation isFinal */
                isFinal?: (boolean|null);

                /** Translation lang */
                lang?: (string|null);

                /** Translation texts */
                texts?: (string[]|null);
            }

            /** Represents a Translation. */
            class Translation implements ITranslation {

                /**
                 * Constructs a new Translation.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: agora.audio.stt.ITranslation);

                /** Translation isFinal. */
                public isFinal: boolean;

                /** Translation lang. */
                public lang: string;

                /** Translation texts. */
                public texts: string[];

                /**
                 * Creates a new Translation instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Translation instance
                 */
                public static create(properties?: agora.audio.stt.ITranslation): agora.audio.stt.Translation;

                /**
                 * Encodes the specified Translation message. Does not implicitly {@link agora.audio.stt.Translation.verify|verify} messages.
                 * @param message Translation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: agora.audio.stt.ITranslation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Translation message, length delimited. Does not implicitly {@link agora.audio.stt.Translation.verify|verify} messages.
                 * @param message Translation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: agora.audio.stt.ITranslation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Translation message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Translation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): agora.audio.stt.Translation;

                /**
                 * Decodes a Translation message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Translation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): agora.audio.stt.Translation;

                /**
                 * Verifies a Translation message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Translation message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Translation
                 */
                public static fromObject(object: { [k: string]: any }): agora.audio.stt.Translation;

                /**
                 * Creates a plain object from a Translation message. Also converts values to other types if specified.
                 * @param message Translation
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: agora.audio.stt.Translation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Translation to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Translation
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}
